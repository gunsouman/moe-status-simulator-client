import Buff from "./buff";

import * as common from "../assets/common_lib";
export default class Effect {
  type: string = "";
  key: string | null = "";
  value: number | string | null = "";
  formula: string = "";
  target: string = "";
  probability: string | null = "";
  clustering: string | null = null;
  cond: string = "";
  other: string = "";
  to: string = "";
  from: string = "";
  constructor(Effect: any) {
    // super(props);
    this.type = Effect.type;
    this.key = Effect.key;
    this.value = Effect.value;
    this.formula = Effect.formula;
    this.target = Effect.target;
    this.probability = Effect.probability;
    this.clustering = Effect.clustering !== "" ? Effect.clustering : null;
    this.cond = Effect.cond;
    this.other = Effect.other;
    this.to = Effect.to;
    this.from = Effect.from;
  }

  static getOtherBuffDataString(target_effect: Effect) {
    let buff_str = "";
    if (buff_str.length > 0) buff_str += " ";
    if (target_effect.type === "status_up") {
      buff_str += target_effect.key;
      let _val = target_effect.value;
      if (target_effect.formula === "*") {
        if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
        buff_str += common.NumberToStr(_val) + "%";
      } else buff_str += common.NumberToStr(_val);
    }
    if (target_effect.type === "regenerate") {
      buff_str += target_effect.key;
      let _val = target_effect.value;
      buff_str += `${common.NumberToStr(_val)}/${target_effect.formula}`;
    }
    if (target_effect.type === "delay") {
      buff_str += target_effect.key + "ディレイ";
      let _val = target_effect.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    if (target_effect.type === "incantation") {
      buff_str += target_effect.key + "詠唱時間";
      let _val = target_effect.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    // "reduce",
    if (target_effect.type === "reduce") {
      buff_str += target_effect.key;
      let _val = target_effect.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += common.NumberToStr(_val);
    }
    // "reflection",
    if (target_effect.type === "reactive") {
    }
    // "conversion",
    if (target_effect.type === "conversion") {
      let _val = target_effect.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += `${target_effect.from}の${_val}%を${target_effect.to}に変換`;
    }
    // "skill_up",
    if (target_effect.type === "skill_up") {
      buff_str += `${target_effect.key}+${target_effect.value}`;
    }
    // "increased",
    if (target_effect.type === "increased") {
      buff_str += target_effect.key;
      let _val = target_effect.value;
      if (target_effect.formula === "*") {
        if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
        buff_str += common.NumberToStr(_val) + "%";
      } else buff_str += common.NumberToStr(_val);

      if (target_effect.key === "クリティカル率") {
        buff_str += `(${target_effect.clustering})`;
      }
    }
    // "vamp",
    if (target_effect.type === "vamp") {
      let _val = target_effect.value;
      if (typeof _val == "number") _val = Number((_val * 100 - 100).toFixed());
      buff_str += `ダメージの${_val}% ${target_effect.target}`;
    }
    // "enchantment"
    if (target_effect.type === "enchantment") {
      buff_str += `追撃(${target_effect.key})`;
    }
    // "can_skill",
    if (target_effect.type === "can_skill") {
      buff_str += `スキル使用可能「${target_effect.key}」`;
    }
    // "add_skill",
    if (target_effect.type === "add_skill") {
      buff_str += `スキル追加「${target_effect.key}」`;
    }
    // "other",
    if (target_effect.type === "other") {
      buff_str += target_effect.key;
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
        sentence += `${this.key}自然回復:`;
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
        } else if (this.formula === "*") {
          if (typeof this.value == "number") {
            let _value = this.value - 1;
            sentence += _value > 0 ? "+" : "";
            sentence += Number((_value * 100).toFixed());
          } else {
            sentence += "?";
          }
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
      case "reactive":
        break;
      case "enchantment":
        break;
      case "vamp":
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
    if (this.clustering) {
      sentence += `(${this.clustering})`;
    }

    return sentence;
  }
}
