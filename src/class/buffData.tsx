import Buff from "../class/buff";

import * as common from "../assets/common_lib";
export default class BuffData {
  type: string = "";
  key: string | null = "";
  value: number | string | null = "";
  formula: string = "";
  target: string = "";
  probability: string | null = "";
  class: string = "";
  cond: string = "";
  other: string = "";
  to: string = "";
  from: string = "";
  constructor(buffData: any) {
    // super(props);
    this.type = buffData.type;
    this.key = buffData.key;
    this.value = buffData.value;
    this.formula = buffData.formula;
    this.target = buffData.target;
    this.probability = buffData.probability;
    this.class = buffData.class;
    this.cond = buffData.cond;
    this.other = buffData.other;
    this.to = buffData.to;
    this.from = buffData.from;
  }

  static getOtherBuffDataString(target_buffData: BuffData) {
    let buff_str = "";
    if (buff_str.length > 0) buff_str += " ";
    if (target_buffData.type === "status_up") {
      buff_str += target_buffData.key;
      let _val = target_buffData.value;
      if (target_buffData.formula === "*") {
        if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
        console.log("_val", target_buffData, _val);
        buff_str += common.NumberToStr(_val) + "%";
      } else buff_str += common.NumberToStr(_val);
    }
    if (target_buffData.type === "regenerate") {
      buff_str += target_buffData.key;
      let _val = target_buffData.value;
      buff_str += `${common.NumberToStr(_val)}/${target_buffData.formula}`;
    }
    if (target_buffData.type === "delay") {
      buff_str += target_buffData.key + "ディレイ";
      let _val = target_buffData.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    if (target_buffData.type === "incantation") {
      buff_str += target_buffData.key + "詠唱時間";
      let _val = target_buffData.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    // "reduce",
    if (target_buffData.type === "reduce") {
      buff_str += target_buffData.key;
      let _val = target_buffData.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    // "reflection",
    if (target_buffData.type === "reflection") {
    }
    // "conversion",
    if (target_buffData.type === "conversion") {
      let _val = target_buffData.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += `${target_buffData.from}の${_val}%を${target_buffData.to}に変換`;
    }
    // "skill_up",
    if (target_buffData.type === "skill_up") {
      buff_str += `${target_buffData.key}+${target_buffData.value}`;
    }
    // "increased",
    if (target_buffData.type === "increased") {
      buff_str += target_buffData.key;
      let _val = target_buffData.value;
      if (target_buffData.formula === "*") {
        if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
        buff_str += common.NumberToStr(_val) + "%";
      } else buff_str += common.NumberToStr(_val);
    }
    // "vamp",
    if (target_buffData.type === "vamp") {
      let _val = target_buffData.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += `ダメージの${_val}% ${target_buffData.target}`;
    }
    // "critical",
    if (target_buffData.type === "critical") {
      let _val = target_buffData.value;
      buff_str += `クリティカル+${_val}% (${target_buffData.class})`;
    }
    // "enchantment"
    if (target_buffData.type === "enchantment") {
      buff_str += `追撃(${target_buffData.key})`;
    }
    // "can_skill",
    if (target_buffData.type === "can_skill") {
      buff_str += `スキル使用可能「${target_buffData.key}」`;
    }
    // "add_skill",
    if (target_buffData.type === "add_skill") {
      buff_str += `スキル追加「${target_buffData.key}」`;
    }
    // "other",
    if (target_buffData.type === "other") {
      buff_str += target_buffData.key;
    }
    return buff_str;
  }

  buffDataConvertToSentence(_ownedBuffs?: Buff[]): string {
    let sentence = "";
    switch (this.type) {
      case "status_up":
        sentence += `${this.key}`;
        if (this.formula === "+") {
          if (typeof this.value == "number") {
            sentence += this.value > 0 ? "+" : "";
            sentence += this.value;
          } else {
            sentence += "?";
          }
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += Number((_value * 100).toFixed());
          } else {
            sentence += "?";
          }
          sentence += "%";
        }
        break;
      case "regenerate":
        sentence += `${this.key}:`;
        if (typeof this.value == "number") {
          sentence += this.value > 0 ? "+" : "";
          sentence += this.value;
        } else {
          sentence += "?";
        }
        if (typeof this.formula == "string") {
          sentence += `/${this.formula}`;
        } else {
          sentence += "/?";
        }
        break;
      case "reduce":
        sentence += `軽減:${this.key}:`;

        if (this.formula === "+") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += Number((_value * 100).toFixed());
          } else {
            sentence += "?";
          }
          sentence += "%";
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += Number((_value * 100).toFixed());
          } else {
            sentence += "?";
          }
          sentence += "%";
        } else {
          sentence += "?";
        }
        sentence += "%";

        break;
      case "increased":
        sentence += `${this.key}`;
        if (this.formula === "+") {
          if (typeof this.value == "number") {
            sentence += this.value > 0 ? "+" : "";
            sentence += this.value;
          } else {
            sentence += "?";
          }
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += (_value * 100).toFixed();
          } else {
            sentence += "?";
          }
          sentence += "%";
        }
        break;

      case "delay":
        sentence += `${this.key}ディレイ`;
        if (this.formula === "+") {
          if (typeof this.value == "number") {
            sentence += this.value > 0 ? "+" : "";
            sentence += this.value;
          } else {
            sentence += "?";
          }
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += (_value * 100).toFixed();
          } else {
            sentence += "?";
          }
          sentence += "%";
        }
        break;
      case "incantation":
        sentence += `${this.key}詠唱時間`;
        if (this.formula === "+") {
          if (typeof this.value == "number") {
            sentence += this.value > 0 ? "+" : "";
            sentence += this.value;
          } else {
            sentence += "?";
          }
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += (_value * 100).toFixed();
          } else {
            sentence += "?";
          }
          sentence += "%";
        }
        break;
      case "reflection":
        break;
      case "enchantment":
        break;
      case "vamp":
        break;
      case "critical":
        sentence += `クリティカル率上昇:`;
        if (typeof this.value == "number") {
          sentence += this.value > 0 ? "+" : "";
          sentence += this.value;
        } else {
          sentence += "?";
        }
        sentence += "%";
        if (this.class) {
          sentence += `(${this.class})`;
        }
        break;
      case "conversion":
        let conversion_per_str = "";
        if (typeof this.value == "number") {
          conversion_per_str += this.value > 0 ? "+" : "";
          conversion_per_str += this.value;
        } else {
          conversion_per_str += "?";
        }
        conversion_per_str += "%";

        sentence += this.from;
        sentence += `の${conversion_per_str}を`;
        sentence += this.to;
        sentence += "に変換";
        break;
      case "skill_up":
        if (typeof this.key !== "string") return;
        // @ts-ignore
        sentence += `スキル効果上昇:${this.key}`;
        if (typeof this.value == "number") {
          sentence += this.value > 0 ? "+" : "";
          sentence += this.value;
        } else {
          sentence += "?";
        }
        break;

      case "other":
        sentence += `${this.key}`;
        break;
      case "add_skill":
        sentence += `スキル使用可能:${this.key}`;
        break;
      case "can_skill":
        sentence += `スキル使用可能(技書とノアピは別途用意):${this.key}`;
        break;
    }
    if (this.cond) {
      sentence += `(${this.cond})`;
    }

    return sentence;
  }
}
