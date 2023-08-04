import Effect from "./effect";

export default class Buff {
  name: string = "";
  type: string | null = "";
  clustering: string | null = null;
  text: string = "";
  otherIndex: string | null = null;
  effect_origins: { [key: string]: any }[] = [];
  effects: Effect[] = [];

  constructor(buff_info: any, otherIndex: string | null = null) {
    // super(props);
    this.name = buff_info["name"];
    this.type = buff_info["type"];
    this.clustering = buff_info["clustering"] !== "" ? buff_info["clustering"] : null;
    this.text = buff_info["text"];
    this.effect_origins = buff_info["effects"] || [];
    this.otherIndex = otherIndex;
    for (let _effect_origin of this.effect_origins) {
      if (_effect_origin.type === "regenerate" && _effect_origin.formula.indexOf("s") !== -1) {
        let sec_value = parseInt(_effect_origin.formula.match(/\d+/)[0], 10);
        if (typeof _effect_origin.value === "number") {
          _effect_origin.value = (_effect_origin.value / sec_value) * 60;
          _effect_origin.formula = "min";
        }
      }
      this.effects.push(new Effect(_effect_origin));
    }
  }

  getEffect() {
    return this.text;
  }

  exportJson() {
    return { name: this.name, type: this.type, clustering: this.clustering, effects: this.effects, otherIndex: this.otherIndex };
  }

  // "enchantment"
  //現在選択中のリストは無視したい
  getOtherBuffsString() {
    let buff_str = "";
    for (let _effect of this.effects) {
      if (buff_str.length > 0) buff_str += " ";
      buff_str += Effect.getOtherBuffDataString(_effect);
    }
    return buff_str;
  }

  static convertJsonToBuffs(buff_json: any): Buff[] {
    let _buff = [];
    for (let buff of buff_json) {
      let new_buff = {
        name: buff.name,
        type: buff.type,
        clustering: buff.clustering,
        text: "",
        effects: buff.effects || [],
      };
      _buff.push(new Buff(new_buff, buff.otherIndex));
    }
    return _buff;
  }
}
