import "./App.scss";
import React from "react";

import configs from "./assets/configs";

import Charactor from "./class/charactor";
import Equip from "./class/equip";
import Buff from "./class/buff";
import SaveData from "./class/saveData";

import StatusSelector from "./components/statusSelector";
import StatusResult from "./components/statusResult";
import StatusResultFooter from "./components/statusResultFooter";

// import * as commonService from "./services/common";
import * as equipService from "./services/equips";
import * as buffService from "./services/buffs";

const DB_NAME = "moe-status-simulator";
const SAVEDATA_STORENAME = "charactor-SaveData";
const CONFIG_STORENAME = "config";

type Props = {};
interface State {
  charactor: Charactor;
  race: string;
  skillObj: any;
  otherBuffs: Buff[];
  saveDatas: SaveData[];
  selectSaveDataIndex: number;
  isOpenSkillListModal: boolean;
  skillOmission: boolean;
  sortStatus: { [key: string]: string };
  isOpenEquipBulk: boolean;
  isSpView: number;
}

export default class App extends React.Component<Props, State> {
  statusSelectorRef: React.RefObject<any> = React.createRef();
  statusResultFooterRef: React.RefObject<any> = React.createRef();
  statusResultRef: React.RefObject<any> = React.createRef();
  saveDatas: SaveData[] = [];
  selectSaveDataIndex: number = 0;

  latestEquipUpdateDatetime: Date;

  equips: Equip[] = [];
  equip_obj: { [equip_name: string]: Equip } = {};

  buffs: Buff[] = [];
  buff_obj: { [buff_name: string]: Buff } = {};

  db: IDBDatabase;
  constructor(props: Props) {
    super(props);

    this.state = {
      charactor: null,
      race: null,
      skillObj: null,
      otherBuffs: null,
      saveDatas: null,
      selectSaveDataIndex: null,
      isOpenSkillListModal: null,
      skillOmission: null,
      sortStatus: null,
      isOpenEquipBulk: null,
      isSpView: null,
    };

    this.updateStatus = this.updateStatus.bind(this);
    this.applyGlobalEquip = this.applyGlobalEquip.bind(this);

    console.log("App", this);
  }

  async componentDidMount() {
    await this.loadData();
  }

  // 利用に必要な情報を取得する
  async loadData() {
    try {
      await this.initBuffs();
      await this.initEquips();

      await this.openIndexedDB();

      this.saveDatas = await this.loadSaveData();
      await this.getCaches();
      let _charactor = await this.initCharactor();

      this.setState({
        charactor: _charactor,
        race: _charactor.race,
        skillObj: _charactor.skillObj,
        otherBuffs: _charactor.otherBuffs,
        saveDatas: this.saveDatas,
        selectSaveDataIndex: this.selectSaveDataIndex,
        isOpenSkillListModal: false,
        skillOmission: true,
        sortStatus: { column: "Name", type: "asc" },
        isOpenEquipBulk: false,
        isSpView: 0,
      });

      this.state.charactor.updateState();
      console.log("charactor", this.state.charactor);
    } catch (error) {
      console.error("エラー:", error);
    }
  }

  // 全バフ情報を取得する
  async initBuffs() {
    let res_bufflist = await buffService.getAll();
    for (let buff_name of Object.keys(res_bufflist.buffs)) {
      let _buff = res_bufflist.buffs[buff_name];
      this.buffs.push(_buff);
      this.buff_obj[buff_name] = _buff;
    }
    console.log("buff", this.buff_obj);
  }

  async initEquips() {
    let res_equiplist = await equipService.getAll(this.buff_obj);
    for (let equip_name of Object.keys(res_equiplist.equips)) {
      this.equips.push(res_equiplist.equips[equip_name]);
      this.equip_obj[equip_name] = res_equiplist.equips[equip_name];
    }
    
    this.latestEquipUpdateDatetime = new Date(res_equiplist.last_update)
    
    console.log("equip", this.equip_obj);
  }

  async loadSaveData() {
    let _savedatas: SaveData[] = [];

    const transaction = this.db.transaction([SAVEDATA_STORENAME], "readonly");
    const objectStore = transaction.objectStore(SAVEDATA_STORENAME);

    const promises = [];

    for (let i = 0; i < 10; i++) {
      const request = objectStore.get(i);
      const promise = new Promise<void>((resolve, reject) => {
        request.onsuccess = (event: Event) => {
          const data: any = (event.target as IDBOpenDBRequest).result;
          let _saveData = null;
          if (data) {
            _saveData = new SaveData(
              this.state.selectSaveDataIndex,
              data.name,
              data.race,
              data.skillObj,
              data.partEquipObj,
              data.buffs,
              data.updateDatetime
            );
          } else {
            _saveData = new SaveData(this.state.selectSaveDataIndex, null, null, {}, {}, [], null);
          }
          _savedatas.push(_saveData);
          resolve();
        };

        request.onerror = (event: Event) => {
          console.log("設定未取得:", (event.target as IDBOpenDBRequest).error);
          resolve();
        };
      });

      promises.push(promise);
    }

    await Promise.all(promises);

    return _savedatas;
  }

  async getCaches() {
    this.selectSaveDataIndex = 0;

    const transaction = this.db.transaction([CONFIG_STORENAME], "readonly");
    const objectStore = transaction.objectStore(CONFIG_STORENAME);
    const request = objectStore.get(0);

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        const data: any = (event.target as IDBOpenDBRequest).result;
        try {
          this.selectSaveDataIndex = data.selectSaveDataIndex;
        } catch (e) {
        } finally {
          resolve();
        }
      };
      request.onerror = (event: Event) => {
        console.log("設定未取得:", (event.target as IDBOpenDBRequest).error);
        resolve();
      };
    });
  }

  async openIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

        // オブジェクトストアの作成
        const charactorSaveDataObjectStore = this.db.createObjectStore(SAVEDATA_STORENAME, { keyPath: "id" });
        // インデックスの作成
        charactorSaveDataObjectStore.createIndex("name", "name", {
          unique: false,
        });

        // オブジェクトストアの作成
        const configObjectStore = this.db.createObjectStore(CONFIG_STORENAME, {
          keyPath: "id",
        });
        // インデックスの作成
        configObjectStore.createIndex("name", "name", { unique: false });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
        resolve();
      };

      request.onerror = (event) => {
        console.error("データベースのエラー:", (event.target as IDBOpenDBRequest).error);
        reject(new Error("Failed to open IndexedDB."));
      };
    });
  }

  async initCharactor() {
    let _race = this.saveDatas[this.selectSaveDataIndex].race;
    let _my_skills = this.saveDatas[this.selectSaveDataIndex].skillObj;
    let _my_equips = Equip.convertJsonToEquipParts(this.saveDatas[this.selectSaveDataIndex].partEquipObj, this.equip_obj);
    let _my_other_buffs = Buff.convertJsonToBuffs(this.saveDatas[this.selectSaveDataIndex].buffs);

    let _skillObj: { [skill_name: string]: number } = configs.SKILL_NAMES.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {});
    for (let skill_name in _my_skills) {
      _skillObj[skill_name] = _my_skills[skill_name];
    }

    let _charactor = new Charactor(_race, _skillObj, _my_equips, _my_other_buffs);
    _charactor.updateOtherBuffs();

    return _charactor;
  }

  async updateStatus() {
    const _charactor = this.state.charactor;
    _charactor.updateState();
    await new Promise<void>((resolve) => {
      this.setState({ charactor: _charactor }, () => {
        resolve();
      });
    });
  }

  applyGlobalEquip() {
    console.log("applyGlobalEquip", this.statusSelectorRef);
    if (this.statusSelectorRef.current) this.statusSelectorRef.current.applyGlobalEquip();
  }

  render(): JSX.Element {
    return (
      <div className="App">
        {this.state.charactor != null && (
          <React.Fragment>
            <div>
              <div className="main-tab-frame">
                <div className="main-tabs">
                  <button
                    className={`${this.state.isSpView === 0 ? "selected" : ""}`}
                    onClick={(e) => {
                      this.setState({ isSpView: 0 });
                    }}
                  >
                    入力画面
                  </button>
                  <button
                    className={`${this.state.isSpView === 1 ? "selected" : ""}`}
                    onClick={(e) => {
                      this.setState({ isSpView: 1 });
                    }}
                  >
                    結果表示
                  </button>
                </div>
              </div>
              <div className="main horizontal">
                <div className={`status-selector ${this.state.isSpView === 0 ? "" : "is-sp-disabled"}`}>
                  <StatusSelector
                    ref={this.statusSelectorRef}
                    parent={this}
                    charactor={this.state.charactor}
                    equips={this.equips}
                    updateCharactorCallback={this.updateStatus}
                  />
                </div>
                <div className={`status-result ${this.state.isSpView === 1 ? "" : "is-sp-disabled"}`}>
                  <StatusResult
                    ref={this.statusResultRef}
                    parent={this}
                    equipObj={this.equip_obj}
                    charactor={this.state.charactor}
                    saveDatas={this.state.saveDatas}
                    selectSaveDataIndex={this.state.selectSaveDataIndex}
                    db={this.db}
                  />
                </div>
              </div>
            </div>
            
            <StatusResultFooter
              ref={this.statusResultFooterRef}
              parent={this}
              charactor={this.state.charactor}
            />
          </React.Fragment>
        )}
      </div>
    );
  }
}
