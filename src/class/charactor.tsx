import configs from "../assets/configs";
import Buff from "../class/buff";
import Equip from "../class/equip";
import SaveData from "../class/saveData";

import * as common from "../assets/common_lib";

const LIMIT_BUFF_NUM = 26;

export default class Charactor {
  name: string = "";
  race: string = "newter";
  skillObj: { [key: string]: number } = {}; // スキル値
  partEquipObj: { [key: string]: Equip | null } = {
    "右手": null,
    "左手": null,
    "矢/弾": null,
    "頭(防)": null,
    "胴(防)": null,
    "手(防)": null,
    "パンツ(防)": null,
    "靴(防)": null,
    "肩(防)": null,
    "腰(防)": null,
    "頭(装)": null,
    "顔(装)": null,
    "耳(装)": null,
    "指(装)": null,
    "胸(装)": null,
    "腰(装)": null,
    "背中(装)": null,
  }; // 部署ごとの装備一覧
  buffs: Buff[] = [];
  otherBuffs: Buff[] = [];

  status: { [status_name: string]: any } = {
    HP: 0,
    MP: 0,
    ST: 0,
    ATK: 0,
    HIT: 0,
    DEF: 0,
    AGI: 0,
    MAGIC: 0,
    耐火属性: 0,
    耐水属性: 0,
    耐風属性: 0,
    耐地属性: 0,
    耐無属性: 0,
    MAX_WEIGHT: 0,
    WEIGHT: 0,
    攻撃間隔: 0,
    補正角: 0,
    射程: 0,
    攻撃ディレイ: 0,
    魔法ディレイ: 0,
    詠唱時間: {},
    詠唱移動速度: 0,
    物理ダメージ軽減: 0,
    魔法ダメージ軽減: 0,
    与ダメージ増加: {},
    軽減: {},
    ディレイ全般: {},
    スキル効果アップ: {},
    クリティカル率: {},
    その他上昇系: {},
    盾回避率: null,
  };
  WEIGHT: number;
  isManualDelay: boolean = false;

  constructor(
    _race: string | null = null,
    _skillObj: { [key: string]: any } = {},
    _partEquipObj: { [equip_part: string]: null | Equip } = null,
    _buffs: Buff[] = null
  ) {
    // super(props);
    this.race = _race ? _race : configs.RACES[0];

    for (let SKILL_NAME of configs.SKILL_NAMES) {
      this.skillObj[SKILL_NAME] = 0;
    }
    for (let SKILL_NAME in _skillObj) {
      this.skillObj[SKILL_NAME] = _skillObj[SKILL_NAME];
    }

    this.partEquipObj = {};
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      this.partEquipObj[equip_part] = null;
    }
    if (_partEquipObj) {
      this.partEquipObj = _partEquipObj;
      this.updateEquipBuffs();
    }

    this.buffs = [];
    if (_buffs) this.buffs = _buffs;

    this.otherBuffs = [];
  }

  setEquip(equip: Equip, charactor_part: string = "右手") {
    let old_buffs = this.getEquipBuffs();
    if (equip == null) {
      this.partEquipObj[charactor_part] = null;
    } else {
      let _part = equip.getBui();
      if (_part === "右(1)") {
        this.partEquipObj["右手"] = equip;
        if (this.partEquipObj["左手"] != null && this.partEquipObj["左手"].getBui() === "左(2)") this.partEquipObj["左手"] = null;
      } else if (_part === "右(2)") {
        this.partEquipObj["左手"] = null;
        this.partEquipObj["右手"] = equip;
      } else if (_part === "左(1)") {
        this.partEquipObj["左手"] = equip;
        if (this.partEquipObj["右手"] != null && this.partEquipObj["右手"].getBui() === "右(2)") this.partEquipObj["右手"] = null;
      } else if (_part === "左(2)") {
        this.partEquipObj["左手"] = equip;
        this.partEquipObj["右手"] = null;
      } else if (_part === "右左(1)") {
        this.partEquipObj[charactor_part] = equip;
      } else {
        this.partEquipObj[_part] = equip;
      }
    }

    let new_buffs = this.getEquipBuffs();
    // console.log(equip, target_part, old_buffs, new_buffs)
    let buff_compare = common.compareBuffs(old_buffs, new_buffs);

    for (let buff of buff_compare.add) {
      this.addBuff(buff);
    }
    for (let buff of buff_compare.delete) {
      this.removeBuff(buff);
    }
  }

  updateEquipBuffs() {
    let new_buffs = this.getEquipBuffs();
    // console.log(equip, target_part, old_buffs, new_buffs)
    let buff_compare = common.compareBuffs(this.buffs, new_buffs);
    for (let buff of buff_compare.add) {
      this.addBuff(buff);
    }
    for (let buff of buff_compare.delete) {
      this.removeBuff(buff);
    }
  }

  clearEquip(part: string) {
    this.partEquipObj[part] = null;
  }

  resetEquip() {
    for (let part of Object.keys(this.partEquipObj)) {
      this.clearEquip(part);
    }
  }

  resetEquipAndUpdate() {
    for (let part of Object.keys(this.partEquipObj)) {
      this.clearEquip(part);
    }
    this.updateCurrentBuffs();
    this.updateState();
  }

  getWeaponType(): string | null {
    let _weapon_type: string = "素手";
    if (this.partEquipObj["右手"])
      if (Object.keys(this.partEquipObj["右手"].必要スキル).length > 0) _weapon_type = Object.keys(this.partEquipObj["右手"].必要スキル)[0];

    if (_weapon_type === "盾") _weapon_type = null;
    return _weapon_type;
  }
  // 二刀流などの追撃によるディレイは未実装
  getAttackRate(): number | null {
    let _attack_rate: number = 180; //素手
    let weapon_type = "素手";
    if (this.partEquipObj["右手"]) {
      if (Object.keys(this.partEquipObj["右手"].必要スキル).length > 0) {
        weapon_type = Object.keys(this.partEquipObj["右手"].必要スキル)[0];
        if (weapon_type === "盾") {
          _attack_rate = null;
        } else if (weapon_type === "素手") {
          _attack_rate = 180 + this.partEquipObj["右手"].攻撃間隔;
        } else {
          _attack_rate = this.partEquipObj["右手"].攻撃間隔;
        }
      }
    }
    if (_attack_rate != null) _attack_rate *= 0.9;
    _attack_rate = _attack_rate * this.status.ディレイ全般["技"]["アタック"].total;
    return Number(_attack_rate.toFixed(4));
  }

  setSkillValue(skillName: string, level: number) {
    this.skillObj[skillName] = level;
  }
  resetSkillValue(skillName: string) {
    this.skillObj[skillName] = 0;
  }
  resetSkillValues() {
    for (let SKILL_NAME of configs.SKILL_NAMES) {
      this.skillObj[SKILL_NAME] = 0;
    }
  }
  resetSkillValuesAndUpdate() {
    for (let SKILL_NAME of configs.SKILL_NAMES) {
      this.skillObj[SKILL_NAME] = 0;
    }
    this.updateCurrentBuffs();
    this.updateState();
  }
  getTotalSkillPoint() {
    let _total_point = 0;
    for (let skill_name in this.skillObj) {
      _total_point += this.skillObj[skill_name];
    }
    return _total_point;
  }

  getStatus(status_str: string) {
    return this.status[status_str];
  }

  getRaceRatio(status_type: string): number {
    return getRaceRatio(this.race, status_type);
  }

  addBuff(target_buff: Buff) {
    // 現在のバフ一覧に追加予定のバフが存在しなければ追加する
    if (target_buff.otherIndex != null) {
      if (!this.buffs.some((_buff) => _buff.otherIndex === target_buff.otherIndex)) this.buffs.push(target_buff);
    } else if (!this.buffs.some((_buff) => _buff.name === target_buff.name)) this.buffs.push(target_buff);
  }
  removeBuff(buff: Buff) {
    // 現在のバフ一覧に追加予定のバフが存在しなければ追加する
    this.buffs = this.buffs.filter((_buff) => _buff.name !== buff.name);
  }
  resetBuffs() {
    // 現在のバフ一覧に追加予定のバフが存在しなければ追加する
    this.buffs = [];
  }

  getEquipBuffs(): Buff[] {
    let buffs: Buff[] = [];
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip == null) continue;
      for (let _buff of _equip["buffs"]) {
        if (
          buffs.some((_chara_buff) => {
            return _chara_buff === _buff;
          })
        )
          continue;
        buffs.push(_buff); // 競合を想定していない
      }
    }
    return buffs;
  }

  getOtherBuffs(): Buff[] {
    return this.otherBuffs;
  }
  updateCurrentBuffs(): void {
    let equipBuffs: Buff[] = this.getEquipBuffs();
    let otherBuffs: Buff[] = this.getOtherBuffs();
    this.buffs = [];
    this.buffs = this.buffs.concat(equipBuffs, otherBuffs);
    // this.buffs = this.buffs.slice(0, 26)
  }
  setOtherBuff(buff: Buff) {
    // for(let buff of otherBuffs){
    // }
  }
  setOtherBuffs(buffs: Buff[]) {
    this.otherBuffs = buffs;
  }
  resetOtherBuffs() {
    this.otherBuffs = [];
  }
  resetOtherBuffsAndUpdate() {
    this.otherBuffs = [];
    // for(let i=0;i<=this.otherBuffs.length;i++){
    //   this.otherBuffs.shift()
    // }
    this.updateCurrentBuffs();
    this.updateState();
  }

  updateOtherBuffs() {
    let _otherBuffs: Buff[] = [];
    for (let _buff of this.buffs) {
      if (_buff.otherIndex != null) _otherBuffs.push(_buff);
    }
    this.otherBuffs = _otherBuffs;
  }

  setRace(race_name: string) {
    this.race = race_name;
    console.log("setRace", race_name);
  }

  updateState() {
    this.status.HP = this.getHPTotalCalc();
    this.status.MP = this.getMPTotalCalc();
    this.status.ST = this.getSTTotalCalc();
    this.status.攻撃力 = this.getATKTotalCalc();
    this.status.防御力 = this.getDEFTotalCalc();
    this.status.命中 = this.getHitTotalCalc();
    this.status.回避 = this.getAgiTotalCalc();
    this.status.魔力 = this.getMagicTotalCalc();
    this.status.最大重量 = this.getMaxWeightTotalCalc();
    this.status.WEIGHT = this.getWeightTotalCalc();

    this.status.移動速度 = this.getMoveSpeedTotalCalc();
    this.status.泳ぎ速度 = this.getSwimSpeedTotalCalc();
    this.status.ジャンプ力 = this.getJumpTotalCalc();
    let reg = this.getRegistTotalCalc();
    this.status.耐火属性 = reg["耐火属性"];
    this.status.耐水属性 = reg["耐水属性"];
    this.status.耐風属性 = reg["耐風属性"];
    this.status.耐地属性 = reg["耐地属性"];
    this.status.耐無属性 = reg["耐無属性"];

    this.status.攻撃間隔 = this.getRightAttackInterval();
    this.status.射程 = this.getAttackRange();
    this.status.補正角 = this.getAngle();
    this.status.クリティカル率 = this.getCritical();
    this.status.攻撃ディレイ = this.getSpecialityDelayReduction();
    this.status.魔法ディレイ = this.getSpellDelayReduction();

    this.status.物理ダメージ軽減 = this.getPhysicsDamageReduction();
    this.status.魔法ダメージ軽減 = this.getMagicDamageReduction();

    // this.status.与ダメージ増加 = this.getIncreaseDamages()
    // this.status.生産関連 = this.getProduct()
    this.status.その他上昇系 = this.getIncreased();

    this.status.軽減 = this.getReduces();

    this.status.ディレイ全般 = this.getAllDelayReduction();
    this.status.詠唱時間 = this.getIncantationSpeed();

    this.status.詠唱移動速度 = this.getIncantationMoveSpeedCalc();

    this.status.追加テクニック = this.getAddTechnic();
    this.status.使用可能テクニック = this.getCanUseTechnic();
    this.status.その他バフ効果 = this.getOtherEffect();
    this.status.盾回避率 = this.getShieldAvoidPer();

    this.status.HP自然回復 = this.getRegenerateTotalCalc("HP");
    this.status.MP自然回復 = this.getRegenerateTotalCalc("MP");
    this.status.ST自然回復 = this.getRegenerateTotalCalc("ST");

    this.status.スキル効果アップ = this.getSkillUp();

    this.updateConversions();
  }

  updateConversions(): void {
    let _add_status: { [status_key: string]: number } = {};
    for (let _buff of this.buffs) {
      for (let _effect of _buff.effects) {
        if (_effect.type === "conversion" && typeof _effect["value"] === "number") {
          let _fromValue = this.getStatus(_effect["from"]);
          let _to_value = _fromValue * _effect["value"];
          if (_add_status[_effect["to"]] == null) _add_status[_effect["to"]] = 0;
          _add_status[_effect["to"]] += _to_value;
        }
      }
    }
    for (let _status_key in _add_status) {
      this.status[_status_key] += _add_status[_status_key];
    }
  }

  resetAll() {
    this.name = "";
    this.race = "newter";
    this.resetSkillValues();
    this.partEquipObj = {
      "右手": null,
      "左手": null,
      "矢/弾": null,
      "頭(防)": null,
      "胴(防)": null,
      "手(防)": null,
      "パンツ(防)": null,
      "靴(防)": null,
      "肩(防)": null,
      "腰(防)": null,
      "頭(装)": null,
      "顔(装)": null,
      "耳(装)": null,
      "指(装)": null,
      "胸(装)": null,
      "腰(装)": null,
      "背中(装)": null,
    };
    this.buffs = [];
    this.otherBuffs = [];
    this.status = {
      HP: 0,
      MP: 0,
      ST: 0,
      ATK: 0,
      HIT: 0,
      DEF: 0,
      AGI: 0,
      MAGIC: 0,
      耐火属性: 0,
      耐水属性: 0,
      耐風属性: 0,
      耐地属性: 0,
      耐無属性: 0,
      MAX_WEIGHT: 0,
      WEIGHT: 0,
      攻撃間隔: 0,
      射程: 0,
      補正角: 0,
      攻撃ディレイ: 0,
      魔法ディレイ: 0,
      ディレイ全般: {},
      スキル効果アップ: {},
    };
    this.WEIGHT = 0;
  }

  /************ HP関係 ************/
  getHPTotalCalc() {
    // スキルと種族のHP反映
    let val_race = configs.RACE_STATUS[this.race].HP.init + this.skillObj["生命力"] * configs.STATUS_COEFFICIENTS["HP"] * this.getRaceRatio("HP");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "HP");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "HP" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "HP" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(0));
    return res;
  }

  /************ MP関係 ************/
  getMPTotalCalc() {
    // スキルと種族のHP反映
    let val_race = configs.RACE_STATUS[this.race]["MP"]["init"] + this.skillObj["知能"] * configs.STATUS_COEFFICIENTS["MP"] * this.getRaceRatio("MP");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "MP");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "MP" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "MP" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(0));
    return res;
  }

  /************ ST関係 ************/
  getSTTotalCalc(): number {
    // スキルと種族のHP反映
    let val_race =
      configs.RACE_STATUS[this.race]["ST"]["init"] + this.skillObj["持久力"] * configs.STATUS_COEFFICIENTS["ST"] * this.getRaceRatio("ST");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "ST");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "ST" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "ST" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(0));
    return res;
  }

  // 以下のtotalについてはconversionを含まない
  /************ 攻撃力関係 ************/
  getATKTotalCalc() {
    // スキルと種族の攻撃力反映
    let val_race =
      configs.RACE_STATUS[this.race]["攻撃力"]["init"] + this.skillObj["筋力"] * configs.STATUS_COEFFICIENTS["攻撃力"] * this.getRaceRatio("攻撃力");

    // 武器の攻撃力反映(右手のみ)
    let atk_weapon = 0;
    for (let equip_part of ["右手"]) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) atk_weapon += this.attackWeaponCalc(_equip);
    }

    // 矢/弾
    let _equip = this.partEquipObj["矢/弾"];
    if (_equip != null) atk_weapon += this.attackAmmunitionCalc(_equip);
    
    // 全装備に表記されたステータス加算値
    let atk_add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) atk_add_status += statusAddCalc(_equip, "攻撃力");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "攻撃力" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // 装備記載の乗算値(バフ？)
    let equip_per_status = 1;
    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "攻撃力" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + atk_weapon + atk_add_status + buff_add_status) * equip_per_status * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }
  attackWeaponCalc(_equip: Equip): number {
    return attackWeaponCalc(this, _equip);
  }
  attackAmmunitionCalc(_equip: Equip): number {
    return attackAmmunitionCalc(this, _equip);
  }
  
  /************ 防御力関係 ************/
  getDEFTotalCalc() {
    // スキルと種族のHP反映
    let val_race =
      configs.RACE_STATUS[this.race]["防御力"]["init"] +
      this.skillObj["着こなし"] * configs.STATUS_COEFFICIENTS["防御力"] * this.getRaceRatio("防御力");

    // 着こなしに応じてdef上昇
    let def_armor = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) {
        def_armor += this.defArmorCalc(_equip);
      }
    }

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "防御力");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "防御力" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "防御力" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + def_armor + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }
  defArmorCalc(equip: Equip) {
    return defArmorCalc(this, equip);
  }

  /************ 命中関係 ************/
  getHitTotalCalc() {
    // 武器の攻撃力反映(右手のみ)
    let hit_weapon = 0;
    for (let equip_part of ["右手"]) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) hit_weapon += this.hitWeaponCalc(_equip);
    }

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "命中");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "命中" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "命中" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (hit_weapon + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }
  hitWeaponCalc(equip: Equip | null): number {
    if (equip == null) {
      return this.skillObj["素手"] * this.getRaceRatio("命中") * 0.8;
    } else {
      let hits = [];
      for (let skill_name in equip.必要スキル) {
        hits.push(this.skillObj[skill_name] * this.getRaceRatio("命中") * 0.8);
      }
      const sum = hits.reduce((acc, cur) => acc + cur, 0);
      const avg = sum / hits.length;
      return avg;
    }
  }

  getAgiTotalCalc() {
    // スキルと種族の値反映
    let val_race =
      configs.RACE_STATUS[this.race]["回避"]["init"] + this.skillObj["攻撃回避"] * configs.STATUS_COEFFICIENTS["回避"] * this.getRaceRatio("回避");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "回避");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "回避" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "回避" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getMagicTotalCalc() {
    // スキルと種族の値反映
    let val_race =
      configs.RACE_STATUS[this.race]["魔力"]["init"] + this.skillObj["精神力"] * configs.STATUS_COEFFICIENTS["魔力"] * this.getRaceRatio("魔力");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "魔力");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "魔力" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "魔力" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getRegistTotalCalc(): { [reg_name: string]: number } {
    let res: { [reg_name: string]: number } = { 耐火属性: 0, 耐水属性: 0, 耐風属性: 0, 耐地属性: 0, 耐無属性: 0 };

    // スキルと種族の値反映
    let val_race: number =
      configs.RACE_STATUS[this.race]["呪文抵抗力"]["init"] +
      this.skillObj["呪文抵抗力"] * configs.STATUS_COEFFICIENTS["呪文抵抗力"] * this.getRaceRatio("呪文抵抗力");
    for (let reg_name in res) {
      res[reg_name] += val_race;
    }

    // 全装備に表記されたステータス加算値
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null)
        for (let reg_name in res) {
          if (_equip.status_obj[reg_name]) res[reg_name] += _equip.status_obj[reg_name];
        }
    }

    // バフのステータス加算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        for (let reg_name in res) {
          if (_data["type"] === "status_up" && _data["key"] === reg_name && _data["formula"] === "+" && typeof _data["value"] == "number") {
            res[reg_name] += _data["value"];
          }
        }
        if (_data["type"] === "status_up" && _data["key"] === "耐全属性" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          for (let reg_name in res) {
            res[reg_name] += _data["value"];
          }
        }
      }
    }

    // バフのステータス乗算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        for (let reg_name in res) {
          if (_data["type"] === "status_up" && _data["key"] === reg_name && _data["formula"] === "*" && typeof _data["value"] == "number") {
            res[reg_name] *= _data["value"];
          }
        }
        if (_data["type"] === "status_up" && _data["key"] === "耐全属性" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          for (let reg_name in res) {
            res[reg_name] *= _data["value"];
          }
        }
      }
    }

    for (let reg_name in res) {
      res[reg_name] = Number(res[reg_name].toFixed(1));
    }

    return res;
  }

  getMaxWeightTotalCalc() {
    // スキルと種族の値反映
    let val_race =
      configs.RACE_STATUS[this.race]["重量"]["init"] + this.skillObj["筋力"] * configs.STATUS_COEFFICIENTS["重量"] * this.getRaceRatio("重量");

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "最大重量");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        // console.log(_data, _data["type"], _data["key"], _data["formula"])
        if (_data["type"] === "status_up" && _data["key"] === "最大重量" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "最大重量" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getWeightTotalCalc(): number {
    // 全装備に表記されたステータス加算値
    let weight = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null && _equip.重さ != null && typeof _equip.重さ === "number") weight += _equip.重さ;
    }
    return Number(weight.toFixed(2));
  }

  getMoveSpeedTotalCalc() {
    // スキルと種族の値反映
    let val_race = 100;

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "移動速度");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "移動速度" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "移動速度" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getSwimSpeedTotalCalc() {
    // スキルと種族の値反映
    let val_race = 100;

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "泳ぎ速度");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "泳ぎ速度" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "泳ぎ速度" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getJumpTotalCalc() {
    // スキルと種族の値反映
    let val_race = 100;

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "ジャンプ力");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "ジャンプ力" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "ジャンプ力" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= _data["value"];
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getSpecialityDelayReduction(): number {
    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "攻撃ディレイ");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["key"] === "攻撃ディレイ" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }
    return Number((add_status + buff_add_status).toFixed(1));
  }

  getSpellDelayReduction(): number {
    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "魔法ディレイ");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["key"] === "魔法ディレイ" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }
    return Number((add_status + buff_add_status).toFixed(1));
  }

  getPhysicsDamageReduction(): number {
    // バフのステータス加算値
    let buff_add_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "reduce" &&
          _data["key"] === "物理ダメージ" &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number" &&
          _data["value"] < buff_add_status
        ) {
          buff_add_status = _data["value"];
        }
      }
    }
    return buff_add_status;
  }

  getMagicDamageReduction(): number {
    // バフのステータス加算値
    let buff_add_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "reduce" &&
          _data["key"] === "魔法ダメージ" &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number" &&
          _data["value"] < buff_add_status
        ) {
          buff_add_status = _data["value"];
        }
      }
    }
    return buff_add_status;
  }

  // getIncreaseDamages():{ [key: string]: number }{

  //   // 増加ステータス（加算）
  //   let add_status:{ [key: string]: number } = Object.fromEntries(configs.INCREAS_ADD_NAMES.map(key => [key, 1]))

  //   for(let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)){
  //     for(let _data of buff.effects){
  //       if(_data["type"]==="increased" && configs.INCREAS_ADD_NAMES.indexOf(_data["key"])>-1 && _data["formula"]==="*" && typeof _data["value"] == "number"){
  //         add_status[_data["key"]] += (_data["value"]-1)
  //       }
  //     }
  //   }
  //   return add_status
  // }

  getReduces(): { [reduce_key: string]: number } {
    // 全装備に表記されたステータス加算値
    let add_status: { [key: string]: number } = Object.fromEntries(configs.REDUCE_NAMES.map((key) => [key, 1]));

    // for(let equip_part of configs.EQUIP_CHARACTOR_PARTS){
    //   let _equip = this.partEquipObj[equip_part]
    //   if(_equip!=null){
    //     for(let product_data_key of configs.REDUCE_NAMES){
    //       let _value = statusAddCalc(_equip, product_data_key)
    //       if(_value)add_status[product_data_key] += (_value-1)
    //     }
    //   }
    // }

    // バフのステータス加算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "reduce") {
          if (typeof _data["value"] !== "number") continue;
          // 最大値のみを適用する
          if (configs.REDUCE_MAX_NAMES.indexOf(_data["key"]) > -1) {
            add_status[_data["key"]] = _data["value"];
            // 加算
          } else if (_data["formula"] === "+" && typeof _data["value"] == "number") {
            add_status[_data["key"]] += _data["value"] - 1;
            // 乗算
          } else {
            add_status[_data["key"]] *= _data["value"];
          }
        }
      }
    }

    for (let _data_name in add_status) {
      add_status[_data_name] = Number(add_status[_data_name].toFixed(4));
    }

    return add_status;
  }
  
  getRightAttackInterval(): number {
    // 全装備に表記されたステータス加算値
    let _weapon = 180;
    let _equip = this.partEquipObj["右手"]; // ボウガン未対応
    if (_equip != null)
      if (_equip.必要スキル["素手"] != null) _weapon = 180 + _equip.攻撃間隔;
      else _weapon = _equip.攻撃間隔;

    return _weapon;
  }

  getAttackRange(): number {
    let _range = 0;
    for(let WEAPON_CHARACTOR_PART of configs.WEAPON_CHARACTOR_PARTS){
      let _equip = this.partEquipObj[WEAPON_CHARACTOR_PART];
      if (_equip != null && _equip.射程!=null){
        _range = _equip.射程;
      }
    }
    let _equip = this.partEquipObj["矢/弾"];
    if (_equip != null && _equip.射程!=null){
      _range += _equip.射程;
    }
    return _range;
  }

  getAngle(): number {
    let _range = 0;
    for(let WEAPON_CHARACTOR_PART of configs.WEAPON_CHARACTOR_PARTS){
      let _equip = this.partEquipObj[WEAPON_CHARACTOR_PART];
      if (_equip != null && _equip.補正角!=null){
        _range = _equip.補正角;
      }
    }
    // let _equip = this.partEquipObj["矢/弾"];
    // if (_equip != null && _equip.補正角!=null){
    //   _range += _equip.補正角;
    // }
    return _range;
  }

  getCritical(): { [delay_key: string]: { [delay_key: string]: number } } {
    // バフのステータス加算値
    let buff_add_statuses: { [delay_key: string]: any } = {};
    let _base = this.partEquipObj["右手"] == null ? 17 : 3;
    buff_add_statuses["武器"] = _base;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _effect of buff.effects) {
        if (_effect["type"] === "increased" && _effect["key"] === "クリティカル率") {
          if (buff_add_statuses == null) {
            buff_add_statuses = {};
          }
          if (_effect["clustering"] !== "") {
            if (buff_add_statuses[_effect["clustering"]] == null) {
              buff_add_statuses[_effect["clustering"]] = 0;
            }
            if (buff_add_statuses[_effect["clustering"]] < _effect["value"]) buff_add_statuses[_effect["clustering"]] = _effect["value"];
          } else {
            if (buff_add_statuses[_effect["clustering"]] == null) {
              buff_add_statuses[_effect["clustering"]] = 0;
            }
            buff_add_statuses[_effect["clustering"]] += _effect["value"];
          }
        }
      }
    }
    return buff_add_statuses;
  }

  getAllDelayReduction(): { [key: string]: any } {
    // バフのステータス加算値
    let speciality_delay_calcs: { [delay_key: string]: { [key: string]: number } } = {};
    // ディレイ設定{}
    //A.[攻撃ディレイ減少装備]
    //B.[攻撃ディレイ減少バフ]
    //  A、Bのみ加算で最大-60、ほかは全て乗算
    //C1.[スキル短縮バフ]：最新バフ1つのみ
    //C2.[アタック短縮バフ]：最新バフ1つのみ、アタック時のみ上記のスキル短縮バフを上書き
    //D.スキル値補正：素手（キックスキル100でディレイ20％軽減）
    // 盾（スキル100でディレイ40％軽減）、罠（スキル100でディレイ40％軽減）、投げ（スキル100でスロウのディレイ40％軽減）
    //E.アタック手動補正：-10
    //F.ST200以上補正：-10
    //[$ {(100+A+B)}/{100} * {(100+C)}/{100} * {(100+D)}/{100} * {(100+E)}/{100} * {(100+F)}/{100}  = ディレイ短縮率]

    //ここは、attackの場合は装備に、その他の場合はスキルを参照して定義したい
    for (let _skill_name of configs.SKILL_NAMES) {
      // if(this.skillObj[attack_skill_name]>0)buff_add_statuses[attack_skill_name] = {AB:0,C1:0, C2:0, D:0, E:0, F:0}
      speciality_delay_calcs[_skill_name] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
    }
    speciality_delay_calcs["アタック"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
    speciality_delay_calcs["default"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };

    // スキルによる影響
    if (this.skillObj["キック"] > 0) {
      if (speciality_delay_calcs["素手"] == null) speciality_delay_calcs["素手"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
      speciality_delay_calcs["素手"]["D"] = 1 - this.skillObj["キック"] / 5 / 100;
    }
    if (this.skillObj["盾"] > 0) {
      if (speciality_delay_calcs["盾"] == null) speciality_delay_calcs["盾"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
      speciality_delay_calcs["盾"]["D"] = 1 - (this.skillObj["盾"] * 40) / 100 / 100;
    }
    if (this.skillObj["罠"] > 0) {
      if (speciality_delay_calcs["罠"] == null) speciality_delay_calcs["罠"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
      speciality_delay_calcs["罠"]["D"] = 1 - (this.skillObj["罠"] * 40) / 100 / 100;
    }
    if (this.skillObj["投げ"] > 0) {
      if (speciality_delay_calcs["罠"] == null) speciality_delay_calcs["投げ"] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };
      speciality_delay_calcs["投げ"]["D"] = 1 - (this.skillObj["投げ"] * 40) / 100 / 100;
    }

    // ディレイ削減バフ
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _effect of buff.effects) {
        if (_effect["type"] === "delay" && _effect["formula"] === "*" && typeof _effect["value"] == "number" && _effect["key"] !== "アタック") {
          if (speciality_delay_calcs[_effect["key"]] == null) speciality_delay_calcs[_effect["key"]] = { AB: 1, C1: 1, C2: 1, D: 1, E: 1, F: 1 };

          speciality_delay_calcs[_effect["key"]]["C1"] = Number(_effect["value"].toFixed(2));
        }
      }
    }

    // アタック短縮(未実装)
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _effect of buff.effects) {
        if (_effect["type"] === "delay" && _effect["formula"] === "*" && typeof _effect["value"] == "number" && _effect["key"] === "アタック") {
          speciality_delay_calcs["アタック"]["C2"] = Number(_effect["value"].toFixed(2));
        }
      }
    }

    // 表記ディレイ(スキルのみ)
    for (let _skill_name in speciality_delay_calcs) {
      speciality_delay_calcs[_skill_name]["AB"] = 1 + this.status.攻撃ディレイ / 100;
    }

    //アタック手動補正
    if (this.isManualDelay) {
      speciality_delay_calcs["アタック"]["E"] = 0.9;
    }

    // スタミナディレイ
    if (this.status.ST >= 200) {
      for (let _skill_name in speciality_delay_calcs) {
        speciality_delay_calcs[_skill_name]["F"] *= 0.9;
      }
    } else if (40 <= this.status.ST && this.status.ST < 100) {
      for (let _skill_name in speciality_delay_calcs) {
        speciality_delay_calcs[_skill_name]["F"] *= 1.1;
      }
    } else if (10 <= this.status.ST && this.status.ST < 39) {
      for (let _skill_name in speciality_delay_calcs) {
        speciality_delay_calcs[_skill_name]["F"] *= 1.2;
      }
    } else if (0 <= this.status.ST && this.status.ST < 9) {
      for (let _skill_name in speciality_delay_calcs) {
        speciality_delay_calcs[_skill_name]["F"] *= 1.3;
      }
    }

    let weaponType = this.getWeaponType();
    if (weaponType) {
      speciality_delay_calcs["アタック"]["C1"] = speciality_delay_calcs[weaponType]["C1"];
      speciality_delay_calcs["アタック"]["D"] = speciality_delay_calcs[weaponType]["D"];
    }

    //ディレイ合計値計算
    for (let _skill_name in speciality_delay_calcs) {
      let _speciality_delay_total = 1;
      let speciality_delay_classes = speciality_delay_calcs[_skill_name];
      for (let speciality_delay_class in speciality_delay_classes) {
        _speciality_delay_total *= speciality_delay_classes[speciality_delay_class];
      }
      speciality_delay_calcs[_skill_name]["total"] = _speciality_delay_total;
    }

    // 　　A.[集中力]集中補正：最大-16.6
    // 　　B1.[スキル短縮バフ]：最新バフ1つのみ
    // 　　B2.[スペル短縮バフ]：最新バフ1つのみ、上記のスキル短縮バフ上書き
    // 　　C.[魔法ディレイ減少装備]
    // 　　D.[魔法ディレイ減少バフ]
    //[$ {(100+A)}/{100} * {(100+B)}/{100} * {(100+C+D)}/{100} = ディレイ短縮率]
    let spell_delay_calc: { [delay_key: string]: { [key: string]: number } } = {};

    for (let _skill_name of configs.SKILL_NAMES) {
      spell_delay_calc[_skill_name] = { A: 1, B1: 1, B2: 1, C: 1, D: 1 };
    }
    spell_delay_calc["default"] = { A: 1, B1: 1, B2: 1, C: 1, D: 1 };

    let _spells: { [key: string]: any } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "incantation" &&
          configs.SKILL_NAMES.indexOf(_data["key"]) > -1 &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number"
        ) {
          if (_spells[_data["key"]] == null) _spells[_data["key"]] = 1;
          if (_spells[_data["key"]] > _data["value"]) _spells[_data["key"]] = _data["value"];
        }
      }
    }
    for (let _skill_name in spell_delay_calc) {
      spell_delay_calc[_skill_name]["A"] *= Number(((100 - (this.skillObj["集中力"] * 16.6) / 100) / 100).toFixed(2));
    }
    for (let _skill_name in _spells) {
      if (!_spells[_skill_name]) _spells[_skill_name] = 1;
      spell_delay_calc[_skill_name]["B1"] = Number(_spells[_skill_name].toFixed(2));
    }

    let other_data: { [key: string]: any } = {};
    // 特殊な詠唱情報取得
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "incantation" &&
          configs.SKILL_NAMES.indexOf(_data["key"]) === -1 &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number"
        ) {
          if (other_data[_data["key"]] == null) other_data[_data["key"]] = 1;
          if (other_data[_data["key"]] > _data["value"]) other_data[_data["key"]] = _data["value"];
        }
      }
    }
    if (other_data["魔法詠唱"]) {
      for (let _skill_name in spell_delay_calc) {
        spell_delay_calc[_skill_name]["B2"] = Number(other_data["魔法詠唱"].toFixed(2));
      }
    }

    // 表記ディレイ(スキルのみ)
    for (let _skill_name in spell_delay_calc) {
      spell_delay_calc[_skill_name]["CD"] = 1 + this.status.魔法ディレイ / 100;
    }

    // //ディレイ合計値
    // for(let _skill_name in spell_delay_calc){
    //   console.log(spell_delay_calc[_skill_name])
    //   let _spell_delay_total = 1
    //   let spell_delay_classes = spell_delay_calc[_skill_name]
    //   for(let _delay_class in spell_delay_classes){
    //     _spell_delay_total*=spell_delay_classes[_delay_class]
    //     console.log(_skill_name, _spell_delay_total, _delay_class, spell_delay_classes[_delay_class])
    //   }
    //   spell_delay_calc[_skill_name]["total"] = _spell_delay_total
    // }

    for (let _skill_name in spell_delay_calc) {
      let _valueA = spell_delay_calc[_skill_name]["A"];
      let _valueB = other_data["魔法詠唱"] ? spell_delay_calc[_skill_name]["B2"] : spell_delay_calc[_skill_name]["B1"];
      let _valueCD = spell_delay_calc[_skill_name]["CD"];
      spell_delay_calc[_skill_name]["total"] = Number((_valueA * _valueB * _valueCD).toFixed(2));
    }

    let res: { [key: string]: any } = {
      技: speciality_delay_calcs,
      魔法: spell_delay_calc,
    };
    return res;
  }

  // configs.SPELL_NAMES
  // reduce
  //  delay
  //  incantation
  getIncantationSpeed(): { [key: string]: number } {
    let _incantations: { [key: string]: any } = {};

    // バフのステータス加算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "incantation" &&
          configs.SKILL_NAMES.indexOf(_data["key"]) > -1 &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number"
        ) {
          if (_incantations[_data["key"]] == null) _incantations[_data["key"]] = 1;
          if (_incantations[_data["key"]] > _data["value"]) _incantations[_data["key"]] = _data["value"];
        }
      }
    }

    let incantations_res: { [key: string]: any } = { 技: {}, 魔法: {} };

    incantations_res["技"]["default"] = { A: 1, total: 1 };
    for (let _skill_name of configs.SKILL_NAMES) {
      incantations_res["技"][_skill_name] = { A: 1, total: 1 };
    }

    // スキル = スキル短縮バフ
    // SPELL_NAMES
    for (let _skill_name in _incantations) {
      if (!_incantations[_skill_name]) _incantations[_skill_name] = 1;
      incantations_res["技"][_skill_name]["A"] = _incantations[_skill_name];
    }

    for (let _skill_name in incantations_res["技"]) {
      incantations_res["技"][_skill_name]["total"] = incantations_res["技"][_skill_name]["A"];
    }

    // 魔法詠唱時間 =
    // A.[集中力]補正：最大-16.6
    // B1.[スキル短縮バフ]：最新バフ1つのみ
    // B2.[スペル短縮バフ]：最新バフ1つのみ、上記のスキル短縮バフ上書き
    // (100+A)/100 + (100+B)/100
    incantations_res["魔法"]["default"] = { A: 1, B1: 1, B2: 1, total: 1 };
    for (let _skill_name of configs.SKILL_NAMES) {
      incantations_res["魔法"][_skill_name] = { A: 1, B1: 1, B2: 1, total: 1 };
    }

    let other_data: { [key: string]: any } = {};
    // 特殊な詠唱情報取得
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "incantation" &&
          configs.SKILL_NAMES.indexOf(_data["key"]) === -1 &&
          _data["formula"] === "*" &&
          typeof _data["value"] == "number"
        ) {
          if (other_data[_data["key"]] == null) other_data[_data["key"]] = 1;
          if (other_data[_data["key"]] > _data["value"]) other_data[_data["key"]] = _data["value"];
        }
      }
    }

    for (let _skill_name in incantations_res["魔法"]) {
      incantations_res["魔法"][_skill_name]["A"] *= Number(((100 - (this.skillObj["集中力"] * 16.6) / 100) / 100).toFixed(2));
    }
    for (let _skill_name in _incantations) {
      if (!_incantations[_skill_name]) _incantations[_skill_name] = 1;
      incantations_res["魔法"][_skill_name]["B1"] = Number(_incantations[_skill_name].toFixed(2));
    }
    if (other_data["魔法詠唱"]) {
      for (let _skill_name in incantations_res["魔法"]) {
        incantations_res["魔法"][_skill_name]["B2"] = Number(other_data["魔法詠唱"].toFixed(2));
      }
    }

    for (let _skill_name in incantations_res["魔法"]) {
      let _valueA = incantations_res["魔法"][_skill_name]["A"];
      let _valueB = other_data["魔法詠唱"] ? incantations_res["魔法"][_skill_name]["B2"] : incantations_res["魔法"][_skill_name]["B1"];
      incantations_res["魔法"][_skill_name]["total"] = Number((_valueA * _valueB).toFixed(2));
    }
    return incantations_res;
  }

  getIncantationMoveSpeedCalc() {
    // スキルと種族の値反映
    let val_race = 100;

    // 全装備に表記されたステータス加算値
    let add_status = 0;
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) add_status += statusAddCalc(_equip, "詠唱移動速度");
    }

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "詠唱移動速度" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          buff_add_status += _data["value"];
        }
      }
    }

    // バフのステータス乗算値
    let buff_per_status = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "status_up" && _data["key"] === "詠唱移動速度" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          buff_per_status *= (100 + _data["value"]) / 100;
        }
      }
    }

    let res = (val_race + add_status + buff_add_status) * buff_per_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getRegenerateTotalCalc(type: string) {
    // スキルと種族の値反映
    let val_race = configs.REGENERATE.STAND[type].INIT + this.skillObj["自然回復"] * configs.REGENERATE.STAND[type].RATIO;

    // バフのステータス加算値
    let buff_add_status = 0;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "regenerate" && _data["key"] === type && typeof _data["value"] == "number") {
          if (_data["formula"] === "min") {
            buff_add_status += _data["value"];
          } else {
            let sec = Number(_data["formula"].replace("s", ""));
            let value = (_data["value"] * 60) / sec;
            buff_add_status += value;
          }
        }
      }
    }

    let res = val_race + buff_add_status;
    res = Number(res.toFixed(1));
    return res;
  }

  getSkillUp(): { [delay_key: string]: { [delay_key: string]: number } } {
    // バフのステータス加算値
    let buff_add_statuses: { [delay_key: string]: any } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _effect of buff.effects) {
        if (_effect["type"] === "skill_up") {
          if (buff_add_statuses[_effect["key"]] == null) {
            buff_add_statuses[_effect["key"]] = {};
          }
          if (_effect["clustering"] !== "" && _effect["clustering"] !== null) {
            if (buff_add_statuses[_effect["key"]][_effect["clustering"]] == null) {
              buff_add_statuses[_effect["key"]][_effect["clustering"]] = 0;
            }
            if (buff_add_statuses[_effect["key"]][_effect["clustering"]] < _effect["value"])
              buff_add_statuses[_effect["key"]][_effect["clustering"]] = _effect["value"];
          } else {
            if (buff_add_statuses[_effect["key"]]["他"] == null) {
              buff_add_statuses[_effect["key"]]["他"] = 0;
            }
            buff_add_statuses[_effect["key"]]["他"] += _effect["value"];
          }
        }
      }
    }
    return buff_add_statuses;
  }

  getAddTechnic(): { [delay_key: string]: { [delay_key: string]: number } } {
    // バフのステータス加算値
    let add_tequnics: { [delay_key: string]: any } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "add_skill") {
          add_tequnics[_data["key"]] = 1;
        }
      }
    }
    return add_tequnics;
  }

  getCanUseTechnic(): { [delay_key: string]: { [delay_key: string]: number } } {
    // バフのステータス加算値
    let can_use_tequnics: { [delay_key: string]: any } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "can_skill") {
          can_use_tequnics[_data["key"]] = 1;
        }
      }
    }
    return can_use_tequnics;
  }

  getOtherEffect(): { [delay_key: string]: { [delay_key: string]: any } } {
    // バフのステータス加算値
    let other_buff: { [delay_key: string]: any } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "other") {
          other_buff[_data["key"]] = {};
          if (_data["value"] != null) {
            other_buff[_data["key"]]["value"] = _data["value"];
          }
          if (_data["cond"] != null) {
            other_buff[_data["key"]]["cond"] = _data["cond"];
          }
        }
      }
    }
    return other_buff;
  }

  getShieldAvoidPer(): number | null {
    // バフのステータス加算値
    let shield_avoid_per: number | null = null;
    if (this.partEquipObj["左手"] && this.partEquipObj["左手"].必要スキル["盾"] != null) {
      shield_avoid_per = this.partEquipObj["左手"].回避;
      shield_avoid_per *=
        this.skillObj["盾"] / this.partEquipObj["左手"].必要スキル["盾"] > 1 ? 1 : this.skillObj["盾"] / this.partEquipObj["左手"].必要スキル["盾"];
      shield_avoid_per = Number((shield_avoid_per * 100).toFixed());
    }

    return shield_avoid_per;
  }

  getSkillGrowth(): number {
    let skill_growth_ratio = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "increased" && _data["key"] === "スキル上昇率" && typeof _data["value"] == "number") {
          if (_data["value"] > skill_growth_ratio) skill_growth_ratio = _data["value"];
        }
      }
    }
    return skill_growth_ratio;
  }

  getPetExperience(): number {
    let skill_growth_ratio = 1;
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "increased" && _data["key"] === "スキル上昇率" && typeof _data["value"] == "number") {
          if (_data["value"] > skill_growth_ratio) skill_growth_ratio = _data["value"];
        }
      }
    }
    return skill_growth_ratio;
  }

  getRange(): { [key: string]: number } {
    let add_status: { [key: string]: number } = {};
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (
          _data["type"] === "increased" &&
          (_data["key"].indexOf("範囲") !== -1 || _data["key"].indexOf("射程") !== -1) &&
          typeof _data["value"] == "number"
        ) {
          add_status[_data["key"]] += _data["value"];
        }
      }
    }
    return add_status;
  }
  // 単純に増加できないもの

  getIncreased(): { [key: string]: { [key: string]: number } } {
    // 増加ステータス（加算）
    let add_status: { [key: string]: number } = Object.fromEntries(configs.INCREAS_ADD_NAMES.map((key) => [key, 0]));
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) {
        for (let _data_key of configs.INCREAS_ADD_NAMES) {
          add_status[_data_key] += statusAddCalc(_equip, _data_key);
        }
      }
    }
    // バフのステータス加算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "increased" && _data["formula"] === "+" && typeof _data["value"] == "number") {
          if (add_status[_data["key"]] == null) add_status[_data["key"]] = 0;
          add_status[_data["key"]] += _data["value"];
        }
      }
    }

    // 増加ステータス（乗算）
    let ratio_status: { [key: string]: number } = Object.fromEntries(configs.INCREAS_RATIO_NAMES.map((key) => [key, 1]));
    for (let equip_part of configs.EQUIP_CHARACTOR_PARTS) {
      let _equip = this.partEquipObj[equip_part];
      if (_equip != null) {
        for (let _data_key of configs.INCREAS_RATIO_NAMES) {
          let _value = statusAddCalc(_equip, _data_key);
          if (_value) ratio_status[_data_key] *= _value;
        }
      }
    }
    // バフのステータス乗算値
    for (let buff of this.buffs.slice(0, LIMIT_BUFF_NUM)) {
      for (let _data of buff.effects) {
        if (_data["type"] === "increased" && _data["formula"] === "*" && typeof _data["value"] == "number") {
          if (ratio_status[_data["key"]] == null) ratio_status[_data["key"]] = 1;
          ratio_status[_data["key"]] *= _data["value"];
        }
      }
    }

    return { add: add_status, ratio: ratio_status };
  }

  // 耐象を装備した場合のステータスを出力する
  getEquipValueFromChara(equip: Equip, status_name: string | null = null): any {
    let res = 0;
    if (status_name === "HP") {
      res = this.getHPTotalCalc();
    } else if (status_name === "MP") {
      res = this.getMPTotalCalc();
    } else if (status_name === "ST") {
      res = this.getSTTotalCalc();
    } else if (status_name === "攻撃力") {
      res = this.getATKTotalCalc();
    } else if (status_name === "命中") {
      res = this.getHitTotalCalc();
    } else if (status_name === "防御力") {
      res = this.getDEFTotalCalc();
    } else if (status_name === "回避") {
      res = this.getAgiTotalCalc();
    } else if (status_name === "魔力") {
      res = this.getMagicTotalCalc();
    } else if (status_name === "耐火属性") {
      res = this.getRegistTotalCalc()["耐火属性"];
    } else if (status_name === "耐水属性") {
      res = this.getRegistTotalCalc()["耐水属性"];
    } else if (status_name === "耐風属性") {
      res = this.getRegistTotalCalc()["耐風属性"];
    } else if (status_name === "耐地属性") {
      res = this.getRegistTotalCalc()["耐地属性"];
    } else if (status_name === "耐無属性") {
      res = this.getRegistTotalCalc()["耐無属性"];
    } else if (status_name === "最大重量") {
      res = this.getMaxWeightTotalCalc();
    } else if (status_name === "重量") {
      res = this.getWeightTotalCalc();
    } else if (status_name === "攻撃間隔") {
      res = this.getRightAttackInterval();
    } else if (status_name === "射程") {
      res = this.getAttackRange();
    } else if (status_name === "補正角") {
      res = this.getAngle();
    } else if (status_name === "攻撃ディレイ") {
      res = this.getSpecialityDelayReduction();
    } else if (status_name === "魔法ディレイ") {
      res = this.getSpellDelayReduction();
    }

    return res;
  }

  exportSkillJson() {
    let _skillObj = { ...this.skillObj };
    for (let _skill_name in _skillObj) {
      if (_skillObj[_skill_name] === 0) delete _skillObj[_skill_name];
    }
    return _skillObj;
  }

  exportPartEquipJson() {
    let res_obj: { [part_name: string]: string } = {};
    for (let part_name in this.partEquipObj) {
      if (this.partEquipObj[part_name]) {
        res_obj[part_name] = this.partEquipObj[part_name].name;
      } else {
        res_obj[part_name] = null;
      }
    }
    return res_obj;
  }

  exportOtherBuffsJson() {
    let res_list: { [buff_name: string]: any }[] = [];
    for (let _buff of this.buffs) {
      res_list.push(_buff.exportJson());
    }
    return res_list;
  }

  importSaveData(_saveData: SaveData, equipObj: { [equip_name: string]: Equip }) {
    this.name = _saveData.name;
    this.race = _saveData.race;

    console.log("_saveData", _saveData);
    this.resetBuffs();

    this.skillObj = configs.SKILL_NAMES.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {});
    for (let skill_name in _saveData.skillObj) {
      this.skillObj[skill_name] = _saveData.skillObj[skill_name];
    }

    for (let part of Object.keys(this.partEquipObj)) {
      this.clearEquip(part);
    }

    let _buffs = Buff.convertJsonToBuffs(_saveData.buffs);
    for (let _buff of _buffs) {
      this.addBuff(_buff);
    }

    this.partEquipObj = {};
    for (let part_name in _saveData.partEquipObj) {
      let _equip = Equip.convertJsonToEquip(_saveData.partEquipObj[part_name], equipObj);
      this.setEquip(_equip, part_name);
    }

    this.updateOtherBuffs();
    this.updateEquipBuffs();
    this.updateCurrentBuffs();
    this.updateState();

    console.log(_saveData.buffs);
    console.log(this);
  }

  exportSaveData(index: number, _save_name: string): any {
    let _saveData = new SaveData(
      index,
      _save_name,
      this.race,
      this.exportSkillJson(),
      this.exportPartEquipJson(),
      this.exportOtherBuffsJson(),
      new Date()
    );

    return _saveData;
  }
}

/***** raceから種族倍率を出力する *****/
const getRaceRatio = (race: string, status_name: string) => {
  return configs.RACE_STATUS[race][status_name]["ratio"];
};

const statusAddCalc = (equip: Equip, status_name: string) => {
  // console.log("statusAddCalc", equip, status_name)
  return equip.status_obj[status_name] ? equip.status_obj[status_name] : 0;
};

/***** charactorを参照する *****/
// スキル値が必要値の8割未満	0
// スキル値が8割以上～必要値未満	0.8～1(スキル値/必要値)
// スキル値が必要値以上	1
const skillExpertiseRatio = (charactor: Charactor, equip: Equip, skill_name: string | null = null) => {
  let prop = 1;
  let skill_names = skill_name ? [skill_name] : Object.keys(equip.必要スキル);
  for (let skill_name of skill_names) {
    prop *= charactor.skillObj[skill_name] / equip.必要スキル[skill_name];
  }
  if (prop > 1) {
    return 1;
  } else if (prop > 0.8) {
    return prop;
  } else {
    return 0;
  }
};

const attackWeaponCalc = (charactor: Charactor, equip: Equip) => {
  let weapon_atk: number | null =
    equip.ATK.HG != null ? equip.ATK.HG : equip.ATK.NG != null ? equip.ATK.NG : equip.ATK.劣 != null ? equip.ATK.劣 : null;
  if (weapon_atk == null) return 0;

  // 素手orナックル装備の場合は、【武器ダメージ = [0.3 ＊ 素手 ＊ (素手 ＋ 200) / 300] ＋ ナックルのダメージ】
  if (equip.必要スキル["素手"] != null) {
    return (
      ((0.3 * charactor.skillObj["素手"] * (charactor.skillObj["素手"] + 200)) / 300 + weapon_atk) * skillExpertiseRatio(charactor, equip, "素手")
    );
  } else {
    let _atk = ((charactor.skillObj["筋力"] + 300) / 350) * weapon_atk;
    _atk *= skillExpertiseRatio(charactor, equip);
    return _atk;
  }
};

const attackAmmunitionCalc = (charactor: Charactor, equip: Equip) => {
  let weapon_atk: number | null = equip.MAX_ATK;
  if (weapon_atk == null) return 0;

  // 武器によって変えたい
  let _atk = weapon_atk;
  _atk *= skillExpertiseRatio(charactor, equip);
  return _atk;
};

const defArmorCalc = (charactor: Charactor, equip: Equip) => {
  let armor_def = equip.AC.HG != null ? equip.AC.HG : equip.AC.NG != null ? equip.AC.NG : equip.AC.劣 != null ? equip.AC.劣 : null;

  if (armor_def == null) return 0;
  // 盾装備時の防御力には、【[(盾スキル ＋ 300) / 350] ＊ 盾AC ＊ 必要スキル補正】を更に加算
  if (equip.必要スキル["盾"] != null) {
    return ((charactor.skillObj["盾"] + 300) / 350) * armor_def * skillExpertiseRatio(charactor, equip, "盾");
  } else {
    return ((charactor.skillObj["着こなし"] + 300) / 350) * armor_def * skillExpertiseRatio(charactor, equip, "着こなし");
  }
};
