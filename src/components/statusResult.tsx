import "./statusResult.scss";

import React from "react";

import configs from "../assets/configs";
import * as common from "../assets/common_lib";
import attention_text from "../assets/attention_text";

import Charactor from "../class/charactor";
import SaveData from "../class/saveData";

import BuffList from "../components/buffList";
import Equip from "../class/equip";

const SAVEDATA_STORENAME = "charactor-SaveData";
const CONFIG_STORENAME = "config";

type Props = {
  parent: any;
  charactor: Charactor;
  saveDatas: SaveData[];
  selectSaveDataIndex: number;
  equipObj: { [equip_name: string]: Equip };
  db: IDBDatabase;
};

interface State {
  charactor: Charactor;
  saveDatas: SaveData[];
  selectSaveDataIndex: number;
  saveTitleInput: string;
  isOpenModalImport: boolean;
  isOpenModalImportSkill: boolean;
  isOpenModalCaution: boolean;
  isAttackDelay: boolean;
  isManualDelay: boolean;
}

export default class StatusResult extends React.Component<Props, State> {
  parent: any;
  charactor: Charactor;
  saveDatas: SaveData[];
  db: IDBDatabase;

  constructor(props: Props) {
    super(props);
    this.parent = props.parent;

    this.saveDatas = props.saveDatas;

    this.db = props.db;

    this.state = {
      charactor: props.charactor,
      saveDatas: this.saveDatas,
      selectSaveDataIndex: props.selectSaveDataIndex,
      saveTitleInput: "",
      isOpenModalImportSkill: false,
      isOpenModalImport: false,
      isOpenModalCaution:false,
      isAttackDelay: false,
      isManualDelay: false,
    };
    console.log(this.saveDatas[props.selectSaveDataIndex]);

    console.log(this.db);

    // this.switchAttackDelay = this.switchAttackDelay.bind(this);
    this.switchManualDelay = this.switchManualDelay.bind(this);
    this.handleSaveTitleChange = this.handleSaveTitleChange.bind(this);
    this.handleSaveDataChange = this.handleSaveDataChange.bind(this);
    this.closeAllModal = this.closeAllModal.bind(this);
    this.openModalImport = this.openModalImport.bind(this);
    this.openModalImportSkill = this.openModalImportSkill.bind(this);
    this.openModalCaution = this.openModalCaution.bind(this);
    this.importSkill = this.importSkill.bind(this);

    this.save = this.save.bind(this);

    this.load = this.load.bind(this);
    this.format = this.format.bind(this);
    this.exportURL = this.exportURL.bind(this);
    this.exportQR = this.exportQR.bind(this);
    this.reset = this.reset.bind(this);

    console.log("StatusResult", this);
  }

  componentDidMount() {
    this.load();
  }

  setCritical() {
    let _skill_up_point = 0;
    let crit_class_obj = this.state.charactor.status.クリティカル率;
    let crit_class_obj_keys = Object.keys(crit_class_obj);
    crit_class_obj_keys.sort();

    let _class_JSXs: any[] = [];
    for (let class_name of crit_class_obj_keys) {
      _skill_up_point += crit_class_obj[class_name];
      let _class_name = class_name === "" ? "他" : class_name.replace("CRIT-", "");
      _class_JSXs.push(
        <span key={"crit_" + class_name} className="critical-child">
          {crit_class_obj[class_name]}%({_class_name})
        </span>
      );
    }
    let res = (
      <React.Fragment>
        <span>クリティカル率:{_skill_up_point}%</span>
        <div className="critical column-3">{_class_JSXs}</div>
      </React.Fragment>
    );
    return res;
  }

  switchManualDelay() {
    let _charactor = this.state.charactor;
    _charactor.isManualDelay = !this.state.isManualDelay;

    this.setState({ charactor: _charactor, isManualDelay: !this.state.isManualDelay });
    this.parent.updateStatus();
  }

  setAttackDelay() {
    if (this.state.charactor.status.ディレイ全般["技"] == null) return;

    let attack_delay_ratio = this.state.charactor.status.ディレイ全般["技"]["アタック"]["total"];

    let _weaponType = this.state.charactor.getWeaponType();

    let attack_delay = Number(this.state.charactor.getAttackDelay().toFixed(2));

    const convertDelayToFrame = (_delay: number) => {
      return _delay / 0.96;
    };
    const convertFrameToMs = (_frame: number) => {
      return (_frame / 60) * 1000;
    };

    let attack_frame = Number(convertDelayToFrame(attack_delay).toFixed(2));
    let attack_seconds = Number((convertFrameToMs(attack_frame) / 1000).toFixed(2));

    const _handleAttackEnter = () => {};
    const _handleAttackLeave = () => {};
    let baloonJSX = (
      <div className="baloon">
        {attack_frame}f {attack_seconds}s
      </div>
    );
    let res = (
      <React.Fragment>
        {_weaponType != null && (
          <div onMouseEnter={_handleAttackEnter} onMouseLeave={_handleAttackLeave}>
            アタックディレイ({_weaponType})：
            <span key={"attack_delay_default"}>
              {Number((attack_delay_ratio * 100).toFixed())}% (delay:{attack_delay})
            </span>
          </div>
        )}
        {_weaponType == null && (
          <div>
            アタックディレイ(--)：<span key={"attack_delay_default"}>--%</span>
          </div>
        )}
        {baloonJSX}
      </React.Fragment>
    );

    return res;
  }

  setReduces() {
    if (this.state.charactor.status.軽減 == null) return;

    let _JSX = [];

    for (let _data_key in this.state.charactor.status.軽減) {
      let total_value = this.state.charactor.status.軽減[_data_key];
      if (total_value === 1) continue;

      total_value = Number((total_value * 100).toFixed());
      let res = (
        <span key={"reduce_" + _data_key}>
          {_data_key}:{total_value}%
        </span>
      );
      _JSX.push(res);
    }

    let res = (
      <React.Fragment>
        <div className="font-12 column-multi">{_JSX}</div>
      </React.Fragment>
    );

    return res;
  }

  setSpecialityDelay() {
    if (this.state.charactor.status.ディレイ全般["技"] == null) return;

    let _JSX = [];
    let default_value = this.state.charactor.status.ディレイ全般["技"]["default"]["total"];

    for (let _skill_name in this.state.charactor.status.ディレイ全般["技"]) {
      if (configs.SKILL_NAMES.indexOf(_skill_name) === -1) continue;
      if (this.state.charactor.skillObj[_skill_name] === 0) continue;
      let total_value = this.state.charactor.status.ディレイ全般["技"][_skill_name]["total"];
      if (total_value === default_value) continue;

      total_value = Number((total_value * 100).toFixed());
      let res = (
        <span key={"special_delay_" + _skill_name}>
          {common.abbreviateSkillName(_skill_name)}:{total_value}%
        </span>
      );
      _JSX.push(res);
    }

    let res = (
      <React.Fragment>
        <div>
          技ディレイ：<span key={"special_delay_default"}>全般:{Number((default_value * 100).toFixed())}%</span>
        </div>
        <div className="font-12 column-multi">{_JSX}</div>
      </React.Fragment>
    );

    return res;
  }

  setSpellDelay() {
    if (this.state.charactor.status.ディレイ全般["魔法"] == null) return;

    let _JSX = [];
    let default_value = this.state.charactor.status.ディレイ全般["魔法"]["default"]["total"];

    for (let _skill_name in this.state.charactor.status.ディレイ全般["魔法"]) {
      if (configs.SKILL_NAMES.indexOf(_skill_name) === -1) continue;
      if (this.state.charactor.skillObj[_skill_name] === 0) continue;
      let total_value = this.state.charactor.status.ディレイ全般["魔法"][_skill_name]["total"];
      if (total_value === default_value) continue;

      total_value = Number((total_value * 100).toFixed());
      let res = (
        <span key={"spell_delay_" + _skill_name}>
          {common.abbreviateSkillName(_skill_name)}:{total_value}%
        </span>
      );
      _JSX.push(res);
    }

    let res = (
      <React.Fragment>
        <div>
          魔法ディレイ：<span key={"spell_delay_default"}>全般:{Number((default_value * 100).toFixed())}%</span>
        </div>
        <div className="font-12 column-multi">{_JSX}</div>
      </React.Fragment>
    );
    return res;
  }

  setIncantationSpeed() {
    if (this.state.charactor.status.ディレイ全般["技"] == null) return;
    if (this.state.charactor.status.ディレイ全般["魔法"] == null) return;

    let default_spec_value = this.state.charactor.status.詠唱時間["技"]["default"]["total"];

    let _JSX1 = [];
    for (let _skill_name in this.state.charactor.status.詠唱時間["技"]) {
      if (configs.SKILL_NAMES.indexOf(_skill_name) === -1) continue;
      if (this.state.charactor.skillObj[_skill_name] === 0) continue;
      let total_value = this.state.charactor.status.詠唱時間["技"][_skill_name]["total"];
      if (total_value === default_spec_value) continue;

      total_value = Number((total_value * 100).toFixed());
      let res = (
        <span key={"incantation_spec_" + _skill_name}>
          {common.abbreviateSkillName(_skill_name)}:{total_value}%
        </span>
      );
      _JSX1.push(res);
    }

    let default_spell_value = this.state.charactor.status.詠唱時間["魔法"]["default"]["total"];

    let _JSX2 = [];
    for (let _skill_name in this.state.charactor.status.詠唱時間["魔法"]) {
      if (configs.SKILL_NAMES.indexOf(_skill_name) === -1) continue;
      if (this.state.charactor.skillObj[_skill_name] === 0) continue;
      let total_value = this.state.charactor.status.詠唱時間["魔法"][_skill_name]["total"];
      if (total_value === default_spell_value) continue;

      total_value = Number((total_value * 100).toFixed());
      let res = (
        <span key={"incantation_spell_" + _skill_name}>
          {common.abbreviateSkillName(_skill_name)}:{total_value}%
        </span>
      );
      _JSX2.push(res);
    }

    let res = (
      <React.Fragment>
        <div>
          技詠唱：<span key={"incantation_spec_default"}>全般:{Number((default_spec_value * 100).toFixed())}%</span>
        </div>
        <div className="font-12 column-multi">{_JSX1}</div>
        <div>
          魔法詠唱：<span key={"incantation_spell_default"}>全般:{Number((default_spell_value * 100).toFixed())}%</span>
        </div>
        <div className="font-12 column-multi">{_JSX2}</div>
      </React.Fragment>
    );

    return res;
  }

  setSkillUp() {
    let _JSX = [];
    for (let skill_name in this.state.charactor.status.スキル効果アップ) {
      let _skill_up_point = 0;
      let _class_JSXs: any[] = [];
      let skill_class_obj = this.state.charactor.status.スキル効果アップ[skill_name];
      for (let class_name in skill_class_obj) {
        _skill_up_point += skill_class_obj[class_name];
        let _class_name = class_name == null || class_name === "" ? "他" : class_name;
        console.log("!!!!!", class_name, _class_name);
        _class_JSXs.push(
          <span key={"skill_up_" + skill_name + class_name} className="skill_up-child">
            {skill_class_obj[class_name]}({_class_name})
          </span>
        );
      }
      let opr = _skill_up_point > 0 ? "+" : "";
      let res = (
        <div key={"skill_up_" + skill_name}>
          <div>
            {skill_name}:{opr}
            {_skill_up_point}
          </div>
          <div>{_class_JSXs.map((_class_JSX, index) => _class_JSX)}</div>
        </div>
      );
      _JSX.push(res);
    }
    return _JSX;
  }

  setIncrease() {
    if (this.state.charactor.status.その他上昇系["add"] == null) return;
    if (this.state.charactor.status.その他上昇系["ratio"] == null) return;

    let _JSX = [];
    for (let _data_name in this.state.charactor.status.その他上昇系["add"]) {
      let _value = this.state.charactor.status.その他上昇系["add"][_data_name];
      let opr = _value > 0 ? "+" : "";
      if (_value !== 0) {
        _JSX.push(
          <span key={"increase_" + _data_name}>
            {_data_name}:{opr}
            {_value}
          </span>
        );
      }
    }

    for (let _data_name in this.state.charactor.status.その他上昇系["ratio"]) {
      let _value = this.state.charactor.status.その他上昇系["ratio"][_data_name];
      if (_value !== 1) {
        _JSX.push(
          <span key={"increase_" + _data_name}>
            {_data_name}:{Number((_value * 100).toFixed(2))}%
          </span>
        );
      }
    }
    return _JSX;
  }

  setAddTechnics() {
    let _JSX = [];
    for (let target_name in this.state.charactor.status.追加テクニック) {
      let res = (
        <div key={"add_teq_" + target_name}>
          <span>{target_name}</span>
        </div>
      );
      _JSX.push(res);
    }

    for (let target_name in this.state.charactor.status.使用可能テクニック) {
      let res = (
        <div key={"can_teq_" + target_name}>
          <span>{target_name}</span>
        </div>
      );
      _JSX.push(res);
    }
    return _JSX;
  }

  setOtherBuffEffect() {
    let _JSX = [];
    for (let target_name in this.state.charactor.status.その他バフ効果) {
      let value = this.state.charactor.status.その他バフ効果[target_name];

      let res = (
        <div key={"other_buff_" + target_name}>
          <span>
            {target_name}
            {value["cond"] != null ? "(" + value["cond"] + ")" : ""}
          </span>
        </div>
      );
      _JSX.push(res);
    }
    let shield_avoid_per = this.state.charactor.status.盾回避率;
    if (shield_avoid_per != null) {
      let res = (
        <div key={"other_buff-shieldavoid"}>
          <span>盾回避率:{shield_avoid_per}%</span>
        </div>
      );
      _JSX.push(res);
    }
    return _JSX;
  }

  putSelectSaveDataIndexDB(index: number) {
    let transaction_config = this.db.transaction([CONFIG_STORENAME], "readwrite");
    let objectStore_config = transaction_config.objectStore(CONFIG_STORENAME);
    let request_config = objectStore_config.put({ id: 0, selectSaveDataIndex: index });

    request_config.onsuccess = (event: Event) => {
      console.log("データが追加されました");
    };

    request_config.onerror = (event: Event) => {
      console.log("データの追加エラー:", (event.target as IDBOpenDBRequest).error);
    };
  }

  selectSaveData(index: number) {
    this.setState({ selectSaveDataIndex: index });
    this.putSelectSaveDataIndexDB(index);
  }
  handleSaveDataChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number(event.target.value);
    this.selectSaveData(value);
  }

  setSaveTitle(text: string) {
    this.setState({ saveTitleInput: text });
  }
  handleSaveTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setSaveTitle(event.target.value);
  }

  updateStatus() {
    this.parent.applyGlobalEquip();
    this.parent.updateStatus();
  }

  async save() {
    let _saveData = this.state.charactor.exportSaveData(this.state.selectSaveDataIndex, this.state.saveTitleInput);
    console.log("_saveData", _saveData, this.state.charactor);
    let self = this;
    let transaction_savedata = this.db.transaction([SAVEDATA_STORENAME], "readwrite");
    let objectStore_savedata = transaction_savedata.objectStore(SAVEDATA_STORENAME);
    let request_savedata = objectStore_savedata.put(_saveData);

    request_savedata.onsuccess = (event: Event) => {
      console.log("データが追加されました");
      let _saveDatas = self.state.saveDatas;
      _saveDatas[self.state.selectSaveDataIndex] = _saveData;
      self.setState({ saveDatas: _saveDatas });
    };

    request_savedata.onerror = (event: Event) => {
      console.log("データの追加エラー:", (event.target as IDBOpenDBRequest).error);
    };
  }

  load() {
    let transaction = this.db.transaction([SAVEDATA_STORENAME], "readonly");
    let objectStore = transaction.objectStore(SAVEDATA_STORENAME);
    let request = objectStore.get(this.state.selectSaveDataIndex);

    request.onsuccess = (event: Event) => {
      let data: any = (event.target as IDBOpenDBRequest).result;
      console.log("データ:", data);
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
        _saveData = new SaveData(this.state.selectSaveDataIndex, "", null, {}, {}, [], null);
      }

      let _charactor = this.state.charactor;
      _charactor.importSaveData(_saveData, this.props.equipObj);
      _charactor.updateOtherBuffs();
      this.setState({ charactor: _charactor, saveTitleInput: _saveData.name });
      this.parent.updateStatus();
    };

    request.onerror = (event: Event) => {
      console.log("データの取得エラー:", (event.target as IDBOpenDBRequest).error);
    };
  }

  format() {
    let transaction = this.db.transaction([SAVEDATA_STORENAME], "readwrite");
    let objectStore = transaction.objectStore(SAVEDATA_STORENAME);
    let request = objectStore.delete(this.state.selectSaveDataIndex);

    let self = this;
    request.onsuccess = function (event: Event) {
      console.log("データが削除されました");

      let _saveDatas = self.state.saveDatas;
      _saveDatas[self.state.selectSaveDataIndex] = new SaveData(self.state.selectSaveDataIndex);
      self.setState({ saveDatas: _saveDatas });
    };

    request.onerror = function (event: Event) {
      console.log("データの削除エラー:", (event.target as IDBOpenDBRequest).error);
    };
  }
  closeAllModal() {
    this.setState({
      isOpenModalImportSkill: false,
      isOpenModalImport: false,
      isOpenModalCaution: false,
    });
  }

  openModalImport() {
    this.setState({ isOpenModalImport: true });
  }

  openModalImportSkill() {
    this.setState({ isOpenModalImportSkill: true });
  }

  openModalCaution() {
    this.setState({ isOpenModalCaution: true });
  }

  renderModalBackground() {
    return <div className="modal-background" onClick={this.closeAllModal}></div>;
  }

  importSkill(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, importText: string) {
    console.log("importText", importText);
  }

  exportURL() {}

  exportQR() {}

  reset() {
    let _charactor = this.state.charactor;
    _charactor.resetAll();
    console.log(_charactor);
    this.setState({ charactor: _charactor });
    this.parent.updateStatus();
  }

  render() {
    return (
      <div className="status-result-frame">
        {(this.state.isOpenModalImport || this.state.isOpenModalImportSkill || this.state.isOpenModalCaution) && this.renderModalBackground()}
        {this.state.isOpenModalImport && (
          <ImportRef
            parent={this}
            charactor={this.state.charactor}
            updateStateFnc={() => {
              this.closeAllModal();
              this.updateStatus();
            }}
          />
        )}
        {this.state.isOpenModalImportSkill && (
          <SkillImportRef
            parent={this}
            charactor={this.state.charactor}
            updateStateFnc={() => {
              this.closeAllModal();
              this.updateStatus();
            }}
          />
        )}
        {this.state.isOpenModalCaution && (
          <Caution
            parent={this}
            updateStateFnc={() => {
              this.closeAllModal();
            }}
          />
        )}
        <div className="status-result">
          <h3>基礎</h3>
          <div className="mains column-3">
            <span className="HP">
              <span className={`${this.state.charactor.status.HP > configs.STATUS_CAP.HP ? "cap-over" : ""}`}>
                <span>HP:</span>
                <span>{this.state.charactor.status.HP}</span>
              </span>
            </span>
            <span className="MP">
              <span className={`${this.state.charactor.status.MP > configs.STATUS_CAP.MP ? "cap-over" : ""}`}>
                <span>MP:</span>
                <span>{this.state.charactor.status.MP}</span>
              </span>
            </span>
            <span className="ST">
              <span className={`${this.state.charactor.status.ST > configs.STATUS_CAP.ST ? "cap-over" : ""}`}>
                <span>ST:</span>
                <span>{this.state.charactor.status.ST}</span>
              </span>
            </span>
          </div>

          <div className="battles column-2">
            <span className="ATK">
              <span className={`${this.state.charactor.status.攻撃力 > configs.STATUS_CAP.攻撃力 ? "cap-over" : ""}`}>
                <span>攻撃力:</span>
                <span>{this.state.charactor.status.攻撃力}</span>
              </span>
            </span>
            <span className="HIT">
              <span className={`${this.state.charactor.status.命中 > configs.STATUS_CAP.命中 ? "cap-over" : ""}`}>
                <span>命中:</span>
                <span>{this.state.charactor.status.命中}</span>
              </span>
            </span>
            <span className="DEF">
              <span className={`${this.state.charactor.status.防御力 > configs.STATUS_CAP.防御力 ? "cap-over" : ""}`}>
                <span>防御力:</span>
                <span>{this.state.charactor.status.防御力}</span>
              </span>
            </span>
            <span className="AGI">
              <span className={`${this.state.charactor.status.回避 > configs.STATUS_CAP.回避 ? "cap-over" : ""}`}>
                <span>回避:</span>
                <span>{this.state.charactor.status.回避}</span>
              </span>
            </span>
            <span className="MAG">
              <span className={`${this.state.charactor.status.魔力 > configs.STATUS_CAP.魔力 ? "cap-over" : ""}`}>
                <span>魔力:</span>
                <span>{this.state.charactor.status.魔力}</span>
              </span>
            </span>
          </div>
          <div className="regist column-2">
            <span className="Fire-REG">
              <span className={`${this.state.charactor.status.耐火属性 > configs.STATUS_CAP.耐火属性 ? "cap-over" : ""}`}>
                <span>耐火属性:</span>
                <span>{this.state.charactor.status.耐火属性}</span>
              </span>
            </span>
            <span className="water-REG">
              <span className={`${this.state.charactor.status.耐水属性 > configs.STATUS_CAP.耐水属性 ? "cap-over" : ""}`}>
                <span>耐水属性:</span>
                <span>{this.state.charactor.status.耐水属性}</span>
              </span>
            </span>

            <span className="wind-REG">
              <span className={`${this.state.charactor.status.耐風属性 > configs.STATUS_CAP.耐風属性 ? "cap-over" : ""}`}>
                <span>耐風属性:</span>
                <span>{this.state.charactor.status.耐風属性}</span>
              </span>
            </span>
            <span className="earth-REG">
              <span className={`${this.state.charactor.status.耐地属性 > configs.STATUS_CAP.耐地属性 ? "cap-over" : ""}`}>
                <span>耐地属性:</span>
                <span>{this.state.charactor.status.耐地属性}</span>
              </span>
            </span>

            <span className="null-REG">
              <span className={`${this.state.charactor.status.耐無属性 > configs.STATUS_CAP.耐無属性 ? "cap-over" : ""}`}>
                <span>耐無属性:</span>
                <span>{this.state.charactor.status.耐無属性}</span>
              </span>
            </span>
          </div>

          <div className="weight column-2">
            <span className="MAX-WEIGHT">
              <span className={`${this.state.charactor.status.最大重量 > configs.STATUS_CAP.最大重量 ? "cap-over" : ""}`}>
                <span>最大重量:</span>
                <span>{this.state.charactor.status.最大重量}</span>
              </span>
            </span>
            <span className="WEIGHT">
              <span>
                <span>装備重量合計:</span>
                <span>{this.state.charactor.status.WEIGHT}</span>
              </span>
            </span>
          </div>

          <div className="column-2">
            <span className="MOVE-SPD">
              <span className={`${this.state.charactor.status.移動速度 > configs.STATUS_CAP.移動速度 ? "cap-over" : ""}`}>
                <span>移動速度:</span>
                <span>{this.state.charactor.status.移動速度}</span>
              </span>
            </span>
            <span className="SWIM-SPD">
              <span className={`${this.state.charactor.status.泳ぎ速度 > configs.STATUS_CAP.泳ぎ速度 ? "cap-over" : ""}`}>
                <span>泳ぎ速度:</span>
                <span>{this.state.charactor.status.泳ぎ速度}</span>
              </span>
            </span>
            <span className="incantation-move-speed">
              <span className={`${this.state.charactor.status.詠唱移動速度 > configs.STATUS_CAP.詠唱移動速度 ? "cap-over" : ""}`}>
                <span>詠唱移動速度:</span>
                <span>{this.state.charactor.status.詠唱移動速度}</span>
              </span>
            </span>
            <span className="JUMP">
              <span className={`${this.state.charactor.status.ジャンプ > configs.STATUS_CAP.ジャンプ ? "cap-over" : ""}`}>
                <span>ジャンプ:</span>
                <span>{this.state.charactor.status.ジャンプ力}</span>
              </span>
            </span>
          </div>

          <h3>自然回復</h3>
          <div className="regenerate column-3">
            <span className="HP-REG">
              <span>
                <span>HP:</span>
                <span>{JSON.stringify(this.state.charactor.status.HP自然回復)}/min</span>
              </span>
            </span>
            <span className="MP-REG">
              <span>
                <span>MP:</span>
                <span>{JSON.stringify(this.state.charactor.status.MP自然回復)}/min</span>
              </span>
            </span>
            <span className="ST-REG">
              <span>
                <span>ST:</span>
                <span>{JSON.stringify(this.state.charactor.status.ST自然回復)}/min</span>
              </span>
            </span>
          </div>

          <h3>ディレイ</h3>
          <div className="delay column-2">
            <span className="ATK-DELAY">
              <span className={`${this.state.charactor.status.攻撃ディレイ < configs.STATUS_CAP.攻撃ディレイ ? "cap-over" : ""}`}>
                <span>攻撃ディレイ軽減:</span>
                <span>{this.state.charactor.status.攻撃ディレイ}</span>
              </span>
            </span>
            <span className="SPELL-DELAY">
              <span className={`${this.state.charactor.status.魔法ディレイ < configs.STATUS_CAP.魔法ディレイ ? "cap-over" : ""}`}>
                <span>魔法ディレイ軽減:</span>
                <span>{this.state.charactor.status.魔法ディレイ}</span>
              </span>
            </span>
          </div>

          <div className="attack-delay-switch-frame">{this.setAttackDelay()}</div>
          <div className="manual-delay-switch-frame">
            <input type="checkbox" id="manual-delay-switch" checked={this.state.isManualDelay} onChange={this.switchManualDelay} />
            <label htmlFor="manual-delay-switch">手動アタックのディレイを適用する</label>
          </div>

          <div className="speciality-delay">{this.setSpecialityDelay()}</div>

          <div className="spell-delay">{this.setSpellDelay()}</div>

          <h3>詠唱</h3>
          <div className="incantation-speed">{this.setIncantationSpeed()}</div>

          <h3>上昇系</h3>
          <div className="increased">{this.setIncrease()}</div>

          <h3>軽減</h3>
          <div className="reduce-cons">{this.setReduces()}</div>

          <h3>スキル効果アップ</h3>
          <div className="skill_up column-2">{this.setSkillUp()}</div>

          <h3>クリティカル率</h3>
          {this.setCritical()}

          <h3>追加テクニック</h3>
          <div>
            <span className="ADD-SKILL">
              <span>
                <span>{this.setAddTechnics()}</span>
              </span>
            </span>
          </div>

          <h3>その他の効果</h3>
          <div>
            <span className="OTHER">
              <span>
                <span>{this.setOtherBuffEffect()}</span>
              </span>
            </span>
          </div>

          <h3>エンチャント</h3>
        </div>

        <h3>バフ一覧</h3>
        <div className="buff-list-frame">
          <BuffList charactor={this.state.charactor} />
        </div>

        <div className="save-frame">
          <div id="save_menu">
            <h2>データ保存</h2>
            <div className="save_menu_block02">
              <div className="select_block">
                <select id="save_list" aria-label="セーブデータの一覧" value={this.state.selectSaveDataIndex} onChange={this.handleSaveDataChange}>
                  {this.state.saveDatas.map((savedata, i) => {
                    return (
                      <option key={i} value={i}>
                        {i}: {savedata.getDateString()} - {savedata.updateDatetime != null ? savedata.name : "空のセーブデータ"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <input
              type="text"
              id="save_name"
              placeholder="セーブデータの名前（空欄可）"
              aria-label="セーブデータの名前"
              value={this.state.saveTitleInput}
              onChange={this.handleSaveTitleChange}
            />
            <div id="save_menu_button" className="button_list button_list--3col">
              <button id="save" className="button" onClick={this.save}>
                データ保存
              </button>
              <button id="load" className="button" onClick={this.load}>
                データ読込
              </button>
              <button id="format" className="button" onClick={this.format}>
                データ削除
              </button>
            </div>
          </div>
          <div id="other_menu" className="button_list button_list--3col">
            <button id="import-text" className="button menu" onClick={this.openModalImport}>
              インポート
            </button>
            <button id="export-url" className="button menu" onClick={this.openModalImportSkill}>
              スキルインポート
            </button>
          </div>
          <div id="other_menu" className="button_list button_list--3col">
            <button id="export-url" className="button menu" onClick={this.reset}>
              データクリア
            </button>
          </div>
        </div>
        <div className="other">
          <button onClick={this.openModalCaution}>注意事項</button>
          <span className="last_update">最終更新時刻:{this.parent.latestEquipUpdateDatetime.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
        </div>
      </div>
    );
  }
}

interface PropsImportRefRef {
  parent: any;
  charactor: Charactor;
  updateStateFnc?: Function;
}

class ImportRef extends React.Component<PropsImportRefRef> {
  my_ref: React.RefObject<HTMLDivElement>;

  handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    this.setState({ exportText: event.target.value });
  };

  getText = () => {
    let _obj = this.props.charactor.exportSaveData(this.props.parent.state.selectSaveDataIndex, this.props.parent.state.saveTitleInput);
    delete _obj["id"];
    delete _obj["updateDatetime"];
    return JSON.stringify(_obj);
  };

  importText = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    let _savedataObj = JSON.parse(this.state.exportText);

    let _saveData = new SaveData(
      _savedataObj.id,
      _savedataObj.name,
      _savedataObj.race,
      _savedataObj.skillObj,
      _savedataObj.partEquipObj,
      _savedataObj.buffs,
      new Date()
    );

    let _charactor = this.props.parent.state.charactor;
    _charactor.importSaveData(_saveData, this.props.parent.props.equipObj);
    _charactor.updateOtherBuffs();
    this.props.parent.setState({ charactor: _charactor, saveTitleInput: _saveData.name });
    this.props.parent.parent.updateStatus();

    console.log("importText", _saveData, _charactor);
    if (this.props.updateStateFnc) this.props.updateStateFnc();
  };

  state = {
    exportText: this.getText(),
  };

  render() {
    return (
      <section className="import-modal" ref={this.my_ref}>
        <div className="content">
          <h2>テキスト入力</h2>
          <div className="items">
            <textarea id="text4" value={this.state.exportText} onChange={this.handleChange}></textarea>
            <div>
              <button
                id="import"
                className="button"
                onClick={(e) => {
                  this.importText(e);
                }}
              >
                読み込む
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

interface PropsSkillImportRef {
  parent: any;
  charactor: Charactor;
  updateStateFnc?: Function;
}

class SkillImportRef extends React.Component<PropsSkillImportRef> {
  my_ref: React.RefObject<HTMLDivElement>;

  handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    this.setState({ importText: event.target.value });
  };

  getSkillText = () => {
    let _text = "";
    for (let skill_name in this.props.charactor.skillObj) {
      if (this.props.charactor.skillObj[skill_name] !== 0)
        _text += configs.SKILLNAME_CONVERT_IMPORT[skill_name] + this.props.charactor.skillObj[skill_name] + " ";
    }
    return _text;
  };

  importSkillText = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const entries = Object.entries(configs.SKILLNAME_CONVERT_IMPORT);
    const swappedEntries = entries.map(([key, value]) => [value, key]);
    const swappedObject = Object.fromEntries(swappedEntries);

    let skillNumTexts = this.state.importText.split(" ");

    this.props.charactor.resetSkillValues();

    for (let skillNumText of skillNumTexts) {
      const regex = /^([^\d]+)(\d+)/;
      const match = skillNumText.match(regex);

      if (match) {
        const stringPart = match[1];
        const numberPart = Number(match[2]);

        if (swappedObject[stringPart]) this.props.charactor.setSkillValue(swappedObject[stringPart], numberPart);
      }
    }

    if (this.props.updateStateFnc) this.props.updateStateFnc();
  };

  state = {
    importText: this.getSkillText(),
  };

  render() {
    return (
      <section className="import-skill-modal" ref={this.my_ref}>
        <div className="content">
          <h2>テキスト入力</h2>
          <div className="items">
            <textarea id="text4" value={this.state.importText} onChange={this.handleChange}></textarea>
            <div>
              <button
                id="import-skill"
                className="button"
                onClick={(e) => {
                  this.importSkillText(e);
                }}
              >
                読み込む
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

interface PropsCaution {
  parent: any;
  updateStateFnc?: Function;
}

class Caution extends React.Component<PropsCaution> {
  my_ref: React.RefObject<HTMLDivElement>;
  
  render() {
    return (
      <section className="caution-modal" ref={this.my_ref}>
        <div className="content">
          <div className="items">
            {attention_text}
            <div>
              <button
                id="caution"
                className="button"
                onClick={(e) => {
                  this.props.updateStateFnc();
                }}
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}