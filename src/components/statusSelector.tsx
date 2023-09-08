import "./statusSelector.scss";

import React from "react";

import configs from "../assets/configs";

import Charactor from "../class/charactor";

import Equip from "../class/equip";

import EquipSelector from "../components/equipSelector";

import EquipBulk from "../components/equipBulk";
import SkillList from "../components/skillPicker";
import OtherBuff from "../components/otherBuff";

type Props = {
  parent: any;
  charactor: Charactor;
  equips: Equip[];
  updateCharactorCallback?: Function;
};

interface State {
  charactor: Charactor;
  equips: Equip[];
  sortStatus: { [key: string]: string };
  isOpenEquipBulk: boolean;
}

export default class StatusSelector extends React.Component<Props, State> {
  parent: any;
  equipSelectorRefs: { [part_name: string]: React.RefObject<any> };
  skillListRef: React.RefObject<any>;
  otherBuffRef: React.RefObject<OtherBuff>;

  constructor(props: Props) {
    super(props);
    this.parent = props.parent;

    this.equipSelectorRefs = {};

    for (let part_name of configs.EQUIP_CHARACTOR_PARTS) {
      this.equipSelectorRefs[part_name] = React.createRef();
    }

    this.state = {
      charactor: props.charactor,
      equips: props.equips,
      sortStatus: { column: configs.EQUIP_TABLE_COLUMNS[0].accessor, type: "asc" },
      isOpenEquipBulk: false,
    };

    this.updateStatus = this.updateStatus.bind(this);
    this.openEquipBulk = this.openEquipBulk.bind(this);
    this.closeEquipBulk = this.closeEquipBulk.bind(this);

    this.setSortStatus = this.setSortStatus.bind(this);

    this.handleRaceChange = this.handleRaceChange.bind(this);

    this.clearAllEquips = this.clearAllEquips.bind(this);
    this.clearAllSkills = this.clearAllSkills.bind(this);
    this.clearAllOtherBuffs = this.clearAllOtherBuffs.bind(this);

    console.log("StatusResult", this);
  }

  openEquipBulk() {
    const equipBulk_button = document.getElementsByClassName("equipBulk-button")[0] as HTMLInputElement;
    equipBulk_button.textContent = "読み込み中です…";
    equipBulk_button.disabled = true;

    setTimeout(() => {
      this.setState({ isOpenEquipBulk: true });
    }, 10);
  }
  closeEquipBulk() {
    // const equipBulk_button = document.getElementsByClassName("equipBulk-button")[0] as HTMLInputElement;
    // equipBulk_button.textContent = "装備を一括設定";
    // equipBulk_button.disabled = false;

    setTimeout(() => {
      this.setState({ isOpenEquipBulk: false });
    }, 10);
  }

  /**全ソート情報を更新する */
  setSortStatus(_sortStatus: { [coluumn: string]: string }) {
    this.setState({ sortStatus: _sortStatus });
  }

  closeModals() {
    for (let part_name of configs.EQUIP_CHARACTOR_PARTS) {
      this.equipSelectorRefs[part_name].current.closeEquipTableModal();
    }
  }

  renderOtherBuffs() {
    return (
      <OtherBuff
        ref={this.otherBuffRef}
        parent={this}
        charactor={this.state.charactor}
        otherBuffs={this.state.charactor.otherBuffs}
        setBuffCallback={this.props.updateCharactorCallback}
      />
    );
  }

  setRace(race_name: string) {
    let _charactor = this.state.charactor;
    _charactor.setRace(race_name);
    this.updateStatus();
  }

  handleRaceChange(event: { target: { value: any } }) {
    this.setRace(event.target.value);
    this.props.updateCharactorCallback();
  }

  /**装備を決定する */
  async setGlobalEquip(_equip: Equip, _part: string) {
    const _charactor = this.state.charactor;
    _charactor.setEquip(_equip, _part);
    this.applyGlobalEquip();
    await this.updateStatus();
  }

  applyGlobalEquip() {
    for (let part_name in this.equipSelectorRefs) {
      if (this.equipSelectorRefs[part_name].current != null) this.equipSelectorRefs[part_name].current.updateEquip();
    }
    this.forceUpdate();
  }

  async updateStatus() {
    await this.props.updateCharactorCallback();
    this.forceUpdate();
  }

  clearAllEquips() {
    this.state.charactor.resetEquipAndUpdate();
    this.updateStatus();
  }

  clearAllSkills() {
    this.state.charactor.resetSkillValuesAndUpdate();
    this.updateStatus();
  }

  clearAllOtherBuffs() {
    this.state.charactor.resetOtherBuffsAndUpdate();
    this.updateStatus();
  }

  render() {
    return (
      <React.Fragment>
        {this.state.isOpenEquipBulk && <EquipBulk parent={this} charactor={this.state.charactor} equips={this.state.equips} />}
        {!this.state.isOpenEquipBulk && <div className="status-selector-frame">
          <h2>
            装備
            <button className="equipBulk-button" style={{ right: 30, position: "absolute" }} onClick={this.openEquipBulk}>
              装備を一括設定
            </button>
            <button className="clear-button" onClick={this.clearAllEquips}>
              clear
            </button>
          </h2>
          <div key="frame-hand" className="frame" id="hand">
            {configs["WEAPON_CHARACTOR_PARTS"].map((charactor_part_name, i) => {
              return (
                <EquipSelector
                  ref={this.equipSelectorRefs[charactor_part_name]}
                  key={"equipSelectors_" + charactor_part_name}
                  parent={this}
                  charactorPart={charactor_part_name}
                  name={charactor_part_name}
                  charactor={this.state.charactor}
                  equips={this.state.equips}
                  selectEquipCallback={this.props.updateCharactorCallback}
                  setSortStatusCallback={this.setSortStatus}
                />
              );
            })}
          </div>
          <div key="frame-ammunition" className="frame" id="hand">
            {configs["AMMUNITION_CHARACTOR_PARTS"].map((charactor_part_name, i) => {
              return (
                <EquipSelector
                  ref={this.equipSelectorRefs[charactor_part_name]}
                  key={"equipSelectors_" + charactor_part_name}
                  parent={this}
                  charactorPart={charactor_part_name}
                  name={charactor_part_name}
                  charactor={this.state.charactor}
                  equips={this.state.equips}
                  selectEquipCallback={this.props.updateCharactorCallback}
                  setSortStatusCallback={this.setSortStatus}
                />
              );
            })}
          </div>
          <div key="frame-armor" className="frame" id="armor">
            {configs["ARMOR_CHARACTOR_PARTS"].map((charactor_part_name, i) => {
              return (
                <EquipSelector
                  ref={this.equipSelectorRefs[charactor_part_name]}
                  key={"equipSelectors_" + charactor_part_name}
                  parent={this}
                  charactorPart={charactor_part_name}
                  name={charactor_part_name}
                  charactor={this.state.charactor}
                  equips={this.state.equips}
                  selectEquipCallback={this.props.updateCharactorCallback}
                  setSortStatusCallback={this.setSortStatus}
                />
              );
            })}
          </div>
          <div key="frame-ornament" className="frame" id="ornament">
            {configs["ORNAMENT_CHARACTOR_PARTS"].map((charactor_part_name, i) => {
              return (
                <EquipSelector
                  ref={this.equipSelectorRefs[charactor_part_name]}
                  key={"equipSelectors_" + charactor_part_name}
                  parent={this}
                  charactorPart={charactor_part_name}
                  name={charactor_part_name}
                  charactor={this.state.charactor}
                  equips={this.state.equips}
                  selectEquipCallback={this.props.updateCharactorCallback}
                  setSortStatusCallback={this.setSortStatus}
                />
              );
            })}
          </div>

          <h2>
            スキル
            <button className="clear-button" onClick={this.clearAllSkills}>
              clear
            </button>
          </h2>
          <SkillList ref={this.skillListRef} parent={this} charactor={this.state.charactor} updateStatusCallback={this.updateStatus} />

          <h2>
            追加BUFF
            <button className="clear-button" onClick={this.clearAllOtherBuffs}>
              clear
            </button>
          </h2>
          {this.renderOtherBuffs()}

          <h2>その他</h2>
          <span>種族</span>
          <select value={this.state.charactor.race} onChange={this.handleRaceChange}>
            {configs.RACES.map((race_name, i) => {
              return (
                <option key={"race_" + race_name} value={race_name}>
                  {configs.RACE_CONVERT_NAME[race_name]}
                </option>
              );
            })}
          </select>
        </div>}
      </React.Fragment>
    );
  }
}
