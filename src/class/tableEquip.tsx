// import configs from '../assets/configs';
import Buff from "./buff";
import Equip from "./equip";
import Charactor from "./charactor";

// interface EquipStatus {
//   HP:{ [key:string]:number }
//   MP:{ [key:string]:number }
//   ST:{ [key:string]:number }

//   攻撃力:{ [key:string]:number }
//   防御力:{ [key:string]:number }
//   命中:{ [key:string]:number }
//   回避:{ [key:string]:number }
//   魔力:{ [key:string]:number }

//   最大重量:{ [key:string]:number }
//   移動速度:{ [key:string]:number }
//   泳ぎ速度:{ [key:string]:number }
//   ジャンプ力:{ [key:string]:number }

//   耐火属性:{ [key:string]:number }
//   耐水属性:{ [key:string]:number }
//   耐風属性:{ [key:string]:number }
//   耐地属性:{ [key:string]:number }
//   耐無属性:{ [key:string]:number }

//   詠唱移動速度:{ [key:string]:number }
//   攻撃ディレイ:{ [key:string]:number }
//   魔法ディレイ:{ [key:string]:number }

//   HP自然回復:{ [key:string]:number }
//   MP自然回復:{ [key:string]:number }
//   ST自然回復:{ [key:string]:number }

//   射程:{ [key:string]:number }
//   重さ:{ [key:string]:number }
// }
interface EquipStatus {
  HP: { total: number; add: number; PER: number };
  MP: { total: number; add: number; PER: number };
  ST: { total: number; add: number; PER: number };

  攻撃力: { total: number; add: number; PER: number };
  防御力: { total: number; add: number; PER: number };
  命中: { total: number; add: number; PER: number };
  回避: { total: number; add: number; PER: number };
  魔力: { total: number; add: number; PER: number };

  最大重量: { total: number; add: number; PER: number };
  移動速度: { total: number; add: number; PER: number };
  泳ぎ速度: { total: number; add: number; PER: number };
  ジャンプ力: { total: number; add: number; PER: number };

  耐火属性: { total: number; add: number; PER: number };
  耐水属性: { total: number; add: number; PER: number };
  耐風属性: { total: number; add: number; PER: number };
  耐地属性: { total: number; add: number; PER: number };
  耐無属性: { total: number; add: number; PER: number };

  詠唱移動速度: { total: number; add: number };
  攻撃ディレイ: { total: number; add: number };
  魔法ディレイ: { total: number; add: number };

  HP自然回復: { total: number; add: number };
  MP自然回復: { total: number; add: number };
  ST自然回復: { total: number; add: number };

  射程: { total: number; add: number; PER: number };
  重さ: { total: number; add: number };
}

export default class TableEquip {
  name: string = "";

  targetEquip: Equip;
  part: string;
  equipStatus: any;

  buffs: Buff[] = [];

  buff_names: string[] = []; // バフ名の一覧を取得
  effect_keys: string[] = [];

  status_names: string[] = [];

  enchantment_buffs: any = {};
  exist_special_conds: any = {};
  percentages: any = {};
  percentages_2: any = {};
  resonance_buffs: any = {};
  silver_bullets: any = {};
  skill_obj: { [key: string]: number } = {};
  others: string[] = [];
  exist_sp_conds: string[] = [];

  constructor(equip: Equip, part: string | null = null) {
    this.name = equip.name;

    this.skill_obj = equip.必要スキル;
    this.buff_names = equip.buff_names;
    this.effect_keys = [];
    for (let _buff of equip.buffs) {
      for (let _effect of _buff.effects) {
        if (_effect.type === "status_up" || _effect.type === "increased") {
          this.effect_keys.push(_effect.key + "増加");
        } else if (_effect.type === "reduce") {
          this.effect_keys.push(_effect.key + "削減");
        } else if (_effect.type === "regenerate") {
          this.effect_keys.push(_effect.key + "自然回復");
        } else if (_effect.type === "skill_up") {
          this.effect_keys.push(_effect.key + "スキル強化");
        } else if (_effect.type === "delay") {
          this.effect_keys.push(_effect.key + "ディレイ短縮");
        } else if (_effect.type === "incantation") {
          this.effect_keys.push(_effect.key + "詠唱短縮");
        } else if (_effect.type === "add_skill") {
          this.effect_keys.push("スキル追加:" + _effect.key);
        } else if (_effect.type === "can_skill") {
          this.effect_keys.push("スキル使用可能:" + _effect.key);
        } else if (_effect.type === "conversion") {
          this.effect_keys.push(_effect.from + "を" + _effect.to + "に変換");
        } else if (_effect.type === "enchantment") {
          this.effect_keys.push("エンチャント:" + _effect.key);
        } else if (_effect.type === "vamp") {
          this.effect_keys.push("与ダメージ回復:" + _effect.key);
        } else if (_effect.type === "reactive") {
          this.effect_keys.push("ダメージ受時:" + _effect.key);
        } else if (_effect.type === "silver_bullet") {
          this.effect_keys.push(_effect.key + "特効");
        } else {
          // console.log(_effect.type, _effect.key, _effect)
          this.effect_keys.push(_effect.key);
        }
      }
    }

    this.status_names = Object.keys(equip.status_obj).map((_val) => {
      return _val + "増加";
    });
    this.exist_sp_conds = equip.特殊条件;

    this.targetEquip = equip;
    this.part = part;
  }

  updateStatus(charactor: Charactor) {
    let _charactor: any = new Charactor(charactor.race, Object.assign({}, charactor.skillObj), Object.assign({}, charactor.partEquipObj), [
      ...charactor.buffs,
    ]);

    _charactor.setEquip(this.targetEquip, this.part);
    _charactor.updateState();

    let _HP = _charactor.status.HP;
    let _MP = _charactor.status.MP;
    let _ST = _charactor.status.ST;
    let _ATK = _charactor.status.攻撃力;
    let _DEF = _charactor.status.防御力;
    let _HIT = _charactor.status.命中;
    let _AGI = _charactor.status.回避;
    let _MAGIC = _charactor.status.魔力;

    let _MAX_WEIGHT = _charactor.status.最大重量;
    let _WEIGHT = _charactor.status.WEIGHT;

    let _MOVE_SPEED = _charactor.status.移動速度;
    let _SWIM_SPEED = _charactor.status.泳ぎ速度;
    let _JUMP = _charactor.status.ジャンプ力;

    let _REGFIRE = _charactor.status.耐火属性;
    let _REGWATER = _charactor.status.耐水属性;
    let _REGWIND = _charactor.status.耐風属性;
    let _REGEARTH = _charactor.status.耐地属性;
    let _REGNULL = _charactor.status.耐無属性;

    let _INCANTMOVE = _charactor.status.詠唱移動速度;
    let _TEC_DELAY = _charactor.status.攻撃ディレイ;
    let _MAGI_DELAY = _charactor.status.魔法ディレイ;

    let _HP_REG = _charactor.status.HP自然回復;
    let _MP_REG = _charactor.status.MP自然回復;
    let _ST_REG = _charactor.status.ST自然回復;

    let _ATTACK_INTERVAL = _charactor.status.攻撃間隔;
    let _RANGE = _charactor.status.射程;
    let _WEIGHT_REDUCE = _charactor.status.重さ軽減;

    let _SKILL_UP = _charactor.status.スキル効果アップ;

    let skill_strs = [];
    for (let skill_name in this.targetEquip.必要スキル) {
      skill_strs.push(skill_name + ":" + this.targetEquip.必要スキル[skill_name]);
    }

    this.equipStatus = {
      name: this.name,
      HP: { total: _HP, add: _HP - charactor.status.HP },
      MP: { total: _MP, add: _MP - charactor.status.MP },
      ST: { total: _ST, add: _ST - charactor.status.ST },

      攻撃力: { total: _ATK, add: _ATK - charactor.status.攻撃力 },
      防御力: { total: _DEF, add: _DEF - charactor.status.防御力 },
      命中: { total: _HIT, add: _HIT - charactor.status.命中 },
      回避: { total: _AGI, add: _AGI - charactor.status.回避 },
      魔力: { total: _MAGIC, add: _MAGIC - charactor.status.魔力 },

      重量: { total: _WEIGHT, add: Number((_WEIGHT - charactor.status.WEIGHT).toFixed(2)) },
      最大重量: { total: _MAX_WEIGHT, add: _MAX_WEIGHT - charactor.status.最大重量 },
      移動速度: { total: _MOVE_SPEED, add: _MOVE_SPEED - charactor.status.移動速度 },
      泳ぎ速度: { total: _SWIM_SPEED, add: _SWIM_SPEED - charactor.status.泳ぎ速度 },
      ジャンプ力: { total: _JUMP, add: _JUMP - charactor.status.ジャンプ力 },

      耐火属性: { total: _REGFIRE, add: _REGFIRE - charactor.status.耐火属性 },
      耐水属性: { total: _REGWATER, add: _REGWATER - charactor.status.耐水属性 },
      耐風属性: { total: _REGWIND, add: _REGWIND - charactor.status.耐風属性 },
      耐地属性: { total: _REGEARTH, add: _REGEARTH - charactor.status.耐地属性 },
      耐無属性: { total: _REGNULL, add: _REGNULL - charactor.status.耐無属性 },

      詠唱移動速度: { total: _INCANTMOVE, add: _INCANTMOVE - charactor.status.詠唱移動速度 },
      攻撃ディレイ: { total: _TEC_DELAY, add: _TEC_DELAY - charactor.status.攻撃ディレイ },
      魔法ディレイ: { total: _MAGI_DELAY, add: _MAGI_DELAY - charactor.status.魔法ディレイ },

      HP自然回復: { total: _HP_REG, add: _HP_REG - charactor.status.HP自然回復 },
      MP自然回復: { total: _MP_REG, add: _MP_REG - charactor.status.MP自然回復 },
      ST自然回復: { total: _ST_REG, add: _ST_REG - charactor.status.ST自然回復 },

      射程: { total: _RANGE, add: 0 },
      重さ軽減: { total: _WEIGHT_REDUCE, add: 0 },

      必要スキル: Object.values(this.targetEquip.必要スキル),
      必要スキル_strs: Object.entries(this.targetEquip.必要スキル).map(([key, value]) => `${key}:${value}`),
      type: "",
      part: this.part,

      素材: null,
      補正角: null,
      部位: this.targetEquip.部位,
      備考: "",
    };
  }

  getValue(statusName: string): string | number | [] {
    return this.equipStatus[statusName];
  }
  getStatusTotal(statusName: string): number {
    return this.equipStatus[statusName].total;
  }
  getStatusAdd(statusName: string): number {
    return this.equipStatus[statusName].add;
  }
  getStatusPer(statusName: string): number | null {
    const value = this.equipStatus[statusName];
    if (typeof value === "number") {
      return value;
    }
    return (this.equipStatus[statusName] as { PER: number })?.PER;
  }

  /**多分equipTableに定義するもとだと思う */
  static convertTextToEquipTableCriteria(filter_equip_name_text: string = "", filter_buff_name_text: string = "") {
    let criteria: any = { $and: [] };
    // 装備名
    if (filter_equip_name_text) {
      let or_query = [];
      or_query.push({ name: { $regex: filter_equip_name_text } });
      criteria["$and"].push({ $or: or_query });
    }

    let filter_buff_name_texts = filter_buff_name_text.split(/[\s/]/);

    for (let _filter_buff_name_text of filter_buff_name_texts) {
      // バフ名とバフの種類
      if (_filter_buff_name_text) {
        let or_query = [];
        or_query.push({ name: { $regex: _filter_buff_name_text } });
        or_query.push({ buff_names: { $elemMatch: { $regex: _filter_buff_name_text } } });
        or_query.push({ effect_keys: { $elemMatch: { $regex: _filter_buff_name_text } } });
        or_query.push({ status_names: { $elemMatch: { $regex: _filter_buff_name_text } } });
        or_query.push({ exist_sp_conds: { $elemMatch: { $regex: _filter_buff_name_text } } });

        or_query.push({ buffs: { $elemMatch: { buff_names: { $regex: _filter_buff_name_text } } } });

        criteria["$and"].push({ $or: or_query });
      }
    }

    return criteria;
  }

  static getCriticalCriteria() {
    return { buffs: { $elemMatch: { effects: { $elemMatch: { key: "クリティカル率" } } } } };
  }

  static getExcludeCantMove() {
    return { buffs: { $not: { $elemMatch: { effects: { $elemMatch: { key: "移動不可" } } } } } };
  }

  static getExcludeCantTec() {
    return { buffs: { $not: { $elemMatch: { effects: { $elemMatch: { $or: [{ key: "アタック使用不可" }, { key: "テクニック使用不可" }] } } } } } };
  }
}
