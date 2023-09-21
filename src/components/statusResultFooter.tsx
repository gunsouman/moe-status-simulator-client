import "./statusResult.scss";

import React from "react";

import configs from "../assets/configs";
import * as common from "../assets/common_lib";

import Charactor from "../class/charactor";
import SaveData from "../class/saveData";

import BuffList from "./buffList";
import Equip from "../class/equip";

const SAVEDATA_STORENAME = "charactor-SaveData";
const CONFIG_STORENAME = "config";

type Props = {
  parent: any;
  charactor: Charactor;
};

interface State {
  charactor: Charactor;
  isAttackDelay: boolean;
  isManualDelay: boolean;
}

export default class StatusResultFooter extends React.Component<Props, State> {
  parent: any;
  charactor: Charactor;

  constructor(props: Props) {
    super(props);
    this.parent = props.parent;

    this.state = {
      charactor: props.charactor,
      isAttackDelay: false,
      isManualDelay: false,
    };

    // this.switchAttackDelay = this.switchAttackDelay.bind(this);
    this.switchManualDelay = this.switchManualDelay.bind(this);

    console.log("StatusResult", this);
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

  updateStatus() {
    this.parent.applyGlobalEquip();
    this.parent.updateStatus();
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
      <div className="status-result-frame" style={{ overflow: "auto" }}>
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
      </div>
    );
  }
}