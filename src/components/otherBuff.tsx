import "./buffList.scss";

import React from "react";

import Buff from "../class/buff";
import configs from "../assets/configs";
import Charactor from "../class/charactor";

import * as foodsService from "../services/foods";
import * as masteryBuffService from "../services/mastery_buffs";
import * as techniqueBuffService from "../services/technique_buffs";

import * as common from "../assets/common_lib";

interface Props {
  parent: any;
  charactor: Charactor;
  otherBuffs: Buff[];
  setBuffCallback?: Function;
}

interface Item {
  name: string;
  type: string;
  effects: { key: string; value: number | string | null; inequality: string; clustering: string }[];
  clustering: string;
  otherIndex: string;
}

interface State {
  charactor: Charactor;
  items: Item[];
}

const ITEM_KEY_CONVERT_NAMES: { [item_key: string]: string } = {
  "status_up:HP": "HP",
  "status_up:MP": "MP",
  "status_up:ST": "ST",
  "status_up:攻撃力": "攻撃力",
  "status_up:防御力": "防御力",
  "status_up:命中": "命中",
  "status_up:回避": "回避",
  "status_up:魔力": "魔力",
  "status_up:WEIGHT": "WEIGHT",
  "status_up:最大重量": "最大重量",
  "status_up:移動速度": "移動速度",
  "status_up:泳ぎ速度": "泳ぎ速度",
  "status_up:ジャンプ力": "ジャンプ力",
  "status_up:攻撃ディレイ": "攻撃ディレイ",
  "status_up:魔法ディレイ": "魔法ディレイ",
  "status_up:耐火属性": "耐火属性",
  "status_up:耐水属性": "耐水属性",
  "status_up:耐風属性": "耐風属性",
  "status_up:耐地属性": "耐地属性",
  "status_up:耐無属性": "耐無属性",
  "status_up:耐全属性": "耐全属性",
  "status_up:詠唱移動速度": "詠唱移動速度",
  "regenerate:HP": "HP自然回復",
  "regenerate:MP": "MP自然回復",
  "regenerate:ST": "ST自然回復",

  "increased:ピッキング失敗回数補正": "ピッキング失敗回数補正",
  "increased:ピッキング回転速度補正": "ピッキング回転速度補正",
  "increased:盗み補正": "盗み補正",
  "increased:SEEING": "SEEING",
  "increased:SMELLING": "SMELLING",
  "increased:HEARING": "HEARING",
  "increased:BREATH": "BREATH",

  "increased:潤喉度": "潤喉度",

  "increased:投擲射程": "投擲射程",
  "increased:音楽範囲": "音楽範囲",
  "increased:シャウト範囲": "シャウト範囲",
  "increased:魔法範囲": "魔法範囲",
  "increased:魔法射程": "魔法射程",
  "increased:銃器射程": "銃器射程",
  "increased:全範囲": "全範囲",
  "increased:詠唱妨害耐性": "詠唱妨害耐性",
  "increased:攻撃力依存ダメージ": "攻撃力依存ダメージ",
  "increased:スキル上昇率": "スキル上昇率",
  "increased:採掘命中率": "採掘命中率",
  "increased:ペット経験値": "ペット経験値",
  "increased:包帯回復量": "包帯回復量",
  "increased:罠回避率上昇": "罠回避率上昇",
  "increased:沈む速度": "沈む速度",
  "increased:盗み成功率": "盗み成功率",
  "increased:サイズ変更": "サイズ変更",
  "increased:牙攻撃力補正": "牙攻撃力補正",
  "increased:牙命中率補正": "牙命中率補正",
  "increased:キック攻撃力補正": "キック攻撃力補正",
  "increased:キック命中率補正": "キック命中率補正",
  "increased:クリティカル率": "クリティカル率",

  "increased:料理ヒットゾーン": "料理ヒットゾーン",
  "increased:料理グレードゾーン": "料理グレードゾーン",
  "increased:料理ゲージ滑り": "料理ゲージ滑り",
  "increased:料理ゲージ速度": "料理ゲージ速度",
  "increased:醸造ヒットゾーン": "醸造ヒットゾーン",
  "increased:醸造グレードゾーン": "醸造グレードゾーン",
  "increased:醸造ゲージ滑り": "醸造ゲージ滑り",
  "increased:醸造ゲージ速度": "醸造ゲージ速度",
  "increased:鍛冶ヒットゾーン": "鍛冶ヒットゾーン",
  "increased:鍛冶グレードゾーン": "鍛冶グレードゾーン",
  "increased:鍛冶ゲージ滑り": "鍛冶ゲージ滑り",
  "increased:鍛冶ゲージ速度": "鍛冶ゲージ速度",
  "increased:木工ヒットゾーン": "木工ヒットゾーン",
  "increased:木工グレードゾーン": "木工グレードゾーン",
  "increased:木工ゲージ滑り": "木工ゲージ滑り",
  "increased:木工ゲージ速度": "木工ゲージ速度",
  "increased:複製ヒットゾーン": "複製ヒットゾーン",
  "increased:複製グレードゾーン": "複製グレードゾーン",
  "increased:複製ゲージ滑り": "複製ゲージ滑り",
  "increased:複製ゲージ速度": "複製ゲージ速度",
  "increased:裁縫ヒットゾーン": "裁縫ヒットゾーン",
  "increased:裁縫グレードゾーン": "裁縫グレードゾーン",
  "increased:裁縫ゲージ滑り": "裁縫ゲージ滑り",
  "increased:裁縫ゲージ速度": "裁縫ゲージ速度",
  "increased:装飾細工ヒットゾーン": "装飾細工ヒットゾーン",
  "increased:装飾細工グレードゾーン": "装飾細工グレードゾーン",
  "increased:装飾細工ゲージ滑り": "装飾細工ゲージ滑り",
  "increased:装飾細工ゲージ速度": "装飾細工ゲージ速度",
  "increased:薬調合ヒットゾーン": "薬調合ヒットゾーン",
  "increased:薬調合グレードゾーン": "薬調合グレードゾーン",
  "increased:薬調合ゲージ滑り": "薬調合ゲージ滑り",
  "increased:薬調合ゲージ速度": "薬調合ゲージ速度",
  "increased:美容ヒットゾーン": "美容ヒットゾーン",
  "increased:美容グレードゾーン": "美容グレードゾーン",
  "increased:美容ゲージ滑り": "美容ゲージ滑り",
  "increased:美容ゲージ速度": "美容ゲージ速度",
  "increased:ミスリル強化ヒットゾーン": "ミスリル強化ヒットゾーン",
  "increased:ミスリル強化滑り": "ミスリル強化滑り",
  "increased:ミスリル強化ゲージ速度": "ミスリル強化ゲージ速度",
  "increased:全ヒットゾーン": "全ヒットゾーン",
  "increased:全グレードゾーン": "全グレードゾーン",
  "increased:全ゲージ滑り": "全ゲージ滑り",
  "increased:全ゲージ速度": "全ゲージ速度",
};

for (let experience_skill_name of configs.EXPERIENCE_SKILL_NAMES) {
  ITEM_KEY_CONVERT_NAMES["skill_up:" + experience_skill_name] = experience_skill_name + "スキル効果アップ";
  ITEM_KEY_CONVERT_NAMES["delay:" + experience_skill_name] = experience_skill_name + "ディレイ";
  ITEM_KEY_CONVERT_NAMES["incantation:" + experience_skill_name] = experience_skill_name + "詠唱時間";
}
ITEM_KEY_CONVERT_NAMES["delay:アタック"] = "アタックディレイ";
ITEM_KEY_CONVERT_NAMES["incantation:魔法"] = "魔法詠唱時間";

ITEM_KEY_CONVERT_NAMES["vamp:HP"] = "与ダメージに比例するHP回復";
ITEM_KEY_CONVERT_NAMES["vamp:MP"] = "与ダメージに比例するMP回復";
ITEM_KEY_CONVERT_NAMES["vamp:ST"] = "与ダメージに比例するST回復";

// ITEM_KEY_CONVERT_NAMES["skill_up"] = "スキル効果アップ"
// ITEM_KEY_CONVERT_NAMES["other"] = "その他";

const BUFF_TYPE_CONVERT_NAME: { [clustering_name: string]: string } = {
  food: "食べ物",
  item: "アイテム",
  skill: "スキル",
  mastery: "マスタリー",
  technique: "テクニック",
};

export default class OtherBuffComponent extends React.Component<Props, State> {
  parent: any;
  candidateBuffs: Buff[] = [];
  constructor(props: Props) {
    super(props);

    this.parent = props.parent;
    this.state = {
      charactor: props.charactor,
      items: this.getItems(props.charactor.otherBuffs),
    };

    this.applyCharactorBuffs = this.applyCharactorBuffs.bind(this);

    console.log("otherBuffComponent", this, React);
  }

  async componentDidMount() {
    const foodList = await foodsService.get(null, null, 999, null, null);
    for (let food_name in foodList) {
      let _buff_bef = foodList[food_name];
      _buff_bef["type"] = "food";
      let _buff = new Buff(_buff_bef, null);
      this.candidateBuffs.push(_buff);
    }
    this.candidateBuffs.sort((a: Buff, b: Buff) => {
      const clusA = a.name;
      const clusB = b.name;
      // null チェック
      if (clusA == null && clusB == null) return 0;
      if (clusA == null) return 1;
      if (clusB == null) return -1;
      // 文字列比較
      return clusA.localeCompare(clusB);
    });
    this.candidateBuffs.sort((a: Buff, b: Buff) => {
      const clusA = a.clustering;
      const clusB = b.clustering;
      // null チェック
      if (clusA == null && clusB == null) return 0;
      if (clusA == null) return 1;
      if (clusB == null) return -1;
      // 文字列比較
      return clusA.localeCompare(clusB);
    });
    console.log(this.candidateBuffs, this.candidateBuffs[0]);

    const masteryBuffList = await masteryBuffService.get(null, null, 999, null, null);
    for (let mastery_name in masteryBuffList) {
      let _buff_bef = masteryBuffList[mastery_name];
      _buff_bef["type"] = "mastery";
      let _buff = new Buff(_buff_bef, null);
      this.candidateBuffs.push(_buff);
    }

    const techniqueBuffList = await techniqueBuffService.get(null, null, 999, null, null);
    for (let technique_name in techniqueBuffList) {
      let _buff_bef = techniqueBuffList[technique_name];
      _buff_bef["type"] = "technique";
      let _buff = new Buff(_buff_bef, null);
      this.candidateBuffs.push(_buff);
    }
    console.log("this.candidateBuffs", this.candidateBuffs);

    for(let candidateBuff of this.candidateBuffs){
      for(let _candidateBuffEffect of candidateBuff.effects){
        let _item_effect_key = `${_candidateBuffEffect.type}:${_candidateBuffEffect.key}`;
        if(ITEM_KEY_CONVERT_NAMES[_item_effect_key]==null){
          if(_candidateBuffEffect.type==="reduce")ITEM_KEY_CONVERT_NAMES[_item_effect_key] = _candidateBuffEffect.key+"軽減"
          if(_candidateBuffEffect.type==="other")ITEM_KEY_CONVERT_NAMES[_item_effect_key] = _candidateBuffEffect.key
          if(_candidateBuffEffect.type==="add_skill")ITEM_KEY_CONVERT_NAMES[_item_effect_key] = `スキル「${_candidateBuffEffect.key}」追加`
        }
      }
    }
    
    for(let candidateBuff of this.candidateBuffs){
      for(let _candidateBuffEffect of candidateBuff.effects){
        let _item_effect_key = `${_candidateBuffEffect.type}:${_candidateBuffEffect.key}`;
        if(ITEM_KEY_CONVERT_NAMES[_item_effect_key]==null){
          console.log("nothing", candidateBuff.name, _item_effect_key)
        }
      }
    }
    
  }

  componentDidUpdate(prevProps: Props) {
    // 親から渡されたデータAが変更された場合、子のstateにも反映する
    if (prevProps.otherBuffs !== this.state.charactor.otherBuffs) {
      this.setState({ items: this.getItems(this.state.charactor.otherBuffs) });
    }
  }

  getItems(otherBuffs: Buff[]) {
    let _items: Item[] = [];
    for (let _otherBuff of otherBuffs) {
      let _item: Item = {
        name: _otherBuff.name,
        type: _otherBuff.type,
        effects: [],
        clustering: _otherBuff.clustering,
        otherIndex: _otherBuff.otherIndex,
      };
      for (let _effect of _otherBuff.effect_origins) {
        let _item_effect = {
          key: `${_effect.type}:${_effect.key ? _effect.key : ""}`,
          value: _effect.value,
          inequality: _effect.formula,
          clustering: _effect.clustering,
        };
        if (_effect.type === "regenerate") {
          _item_effect = {
            key: `${_effect.type}:${_effect.key ? _effect.key : ""}`,
            value: _effect.value,
            inequality: _effect.formula,
            clustering: _effect.clustering,
          };
        }
        _item.effects.push(_item_effect);
      }
      _items.push(_item);
    }

    return _items;
  }

  applyOtherBuffs() {
    this.setState({
      items: this.getItems(this.state.charactor.otherBuffs),
    });
  }

  applyCharactorBuffs(_otherBuffs: Buff[]) {
    // 追加されたか更新されたものを適応する
    let _charactor = this.state.charactor;
    let charactorBuffs: Buff[] = _charactor.buffs;
    for (let _otherBuff of _otherBuffs) {
      let buff_index = charactorBuffs.findIndex((item) => item["otherIndex"] === _otherBuff.otherIndex);
      console.log("_otherBuff", _otherBuff, buff_index);
      if (buff_index === -1) {
        _charactor.addBuff(_otherBuff);
      } else {
        _charactor.buffs[buff_index] = _otherBuff;
      }
    }
    console.log("charactorBuffs", charactorBuffs, _charactor.buffs);

    // 削除されたものをcharactorBuffからも削除
    // charactor内のotherBuffを取り出す
    let existOtherBuffs = charactorBuffs.filter((item) => item.otherIndex != null);
    console.log("existOtherBuffs", existOtherBuffs);
    existOtherBuffs = existOtherBuffs.reverse();
    let delete_otherIndexes = []; //charactorに存在するが、_otherBuffsからなくなったインデックスを取得
    for (let existOtherBuff of existOtherBuffs) {
      if (_otherBuffs.findIndex((item) => item["otherIndex"] === existOtherBuff.otherIndex) === -1) {
        delete_otherIndexes.push(existOtherBuff.otherIndex);
      }
    }
    // charactor.buffsから削除されたbuffの位置を取得する
    let delete_chara_indexes = [];
    for (let delete_otherIndex of delete_otherIndexes) {
      let delete_chara_index = charactorBuffs.findIndex((item) => item["otherIndex"] === delete_otherIndex);
      delete_chara_indexes.push(delete_chara_index);
    }

    delete_chara_indexes
      .sort()
      .reverse()
      .forEach((index) => {
        _charactor.buffs.splice(index, 1);
      });

    console.log("delete_indexes", delete_otherIndexes, delete_chara_indexes);

    this.setState({ charactor: _charactor });
    this.props.setBuffCallback();
  }

  // 描画情報を元にキャラクターのメソッド内のバフ情報を更新する
  syncItemToOtherBuffs(items: Item[]) {
    let _otherBuffs: Buff[] = [];
    for (let item of items) {
      let _buffEffect_array = [];
      for (let _item_effect of item.effects) {
        let _type = _item_effect.key.split(":")[0];
        let _key = _item_effect.key.split(":")[1];
        let _value = _item_effect.value;

        if (_type === "regenerate") {
          let _data = { type: _type, key: _key, value: _value, formula: _item_effect.inequality, clustering: _item_effect.clustering };
          _buffEffect_array.push(_data);
        } else {
          let _data = { type: _type, key: _key, value: _value, formula: _item_effect.inequality, clustering: _item_effect.clustering };
          _buffEffect_array.push(_data);
        }
      }

      let _buff_info = {
        name: item.name,
        effects: _buffEffect_array,
        type: item.type,
        clustering: item.clustering,
        // clustering: "",
      };
      let _buff = new Buff(_buff_info, item.otherIndex);
      _otherBuffs.push(_buff);
    }

    let _charactor = this.state.charactor;
    _charactor.otherBuffs = _otherBuffs;
    this.setState({ charactor: _charactor });
    this.applyCharactorBuffs(_otherBuffs);
  }

  // 画面上のバフ追加
  addItem = () => {
    const _items = this.state.items;
    const _otherIndex = common.generateUniqueIndex();
    _items.push({ name: "", type: null, effects: [], clustering: "", otherIndex: _otherIndex });
    this.setState({ items: _items });

    this.syncItemToOtherBuffs(_items);
  };

  // 画面上のバフの名称変更
  handleNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prevState) => {
      const updatedItems = [...prevState.items];
      updatedItems[index].name = event.target.value;
      this.syncItemToOtherBuffs(updatedItems);
      return { items: updatedItems };
    });
  };

  // 画面上のバフ削除
  removeItem = (index: number) => {
    // indexに耐応する項目を削除する
    const newItems = [...this.state.items];
    newItems.splice(index, 1);
    this.setState({ items: newItems });

    this.syncItemToOtherBuffs(newItems);
  };

  // バフ内の計算式を追加
  addEffect(index: number) {
    const _items = this.state.items;
    for (let a of _items[index].effects) console.log("addEffect1", a);

    _items[index].effects.push({ key: "", value: 0, inequality: "", clustering: "" });
    this.setState({ items: _items });
    this.syncItemToOtherBuffs(_items);

    for (let a of _items[index].effects) console.log("addEffect2", a);
  }

  // inputイベントでバフ内の種類を変更を検知
  handleEffectTypeChange(index: number, effect_index: number, event: React.ChangeEvent<HTMLSelectElement>) {
    this.effectTypeChange(index, effect_index, event.target.value);
  }

  // バフ内の種類を変更
  effectTypeChange(index: number, effect_index: number, text: string) {
    const _items = this.state.items;
    _items[index].effects[effect_index].key = text;
    
    console.log("effectTypeChange", index, effect_index, text)
    this.setState({ items: _items });
    this.syncItemToOtherBuffs(_items);
  }

  // バフ内の数値を変更
  handleEffectValueChange(index: number, effect_index: number, event: React.ChangeEvent<HTMLInputElement>) {
    this.setState((prevState) => {
      const updatedItems = [...prevState.items];
      updatedItems[index].effects[effect_index].value = Number(event.target.value);
      this.syncItemToOtherBuffs(updatedItems);
      return { items: updatedItems };
    });
  }

  // バフ内の情報の計算式や単位を変更
  handleEffectInequalityChange(index: number, effect_index: number, event: React.ChangeEvent<HTMLSelectElement>) {
    this.effectInequalityChange(index, effect_index, event.target.value);
  }

  effectInequalityChange(index: number, effect_index: number, _inequality: string) {
    this.setState((prevState) => {
      const updatedItems = [...prevState.items];
      updatedItems[index].effects[effect_index].inequality = _inequality;
      this.syncItemToOtherBuffs(updatedItems);
      return { items: updatedItems };
    });
  }

  // バフ内の計算式を削除
  removeEffect(item_index: number, effect_index: number) {
    const _items = this.state.items;
    const newItemEffects = [..._items[item_index].effects];
    console.log("newItemEffects1", newItemEffects);
    newItemEffects.splice(effect_index, 1);
    _items[item_index].effects = newItemEffects;
    console.log("newItemEffects2", newItemEffects);
    console.log("_items", _items);
    this.setState({ items: _items });
    this.syncItemToOtherBuffs(_items);
  }

  selectBuffName(candidate: Buff, item_index: number) {
    let _items: Item[] = this.state.items;
    _items[item_index].name = candidate.name;
    _items[item_index].type = candidate.type;
    _items[item_index].clustering = candidate.clustering;

    _items[item_index].effects = [];
    for (let _effect of candidate["effects"]) {
      let _key = null;
      if (_effect.type === "shortening" || _effect.type === "skill_up" || _effect.type === "other") _key = _effect.type;
      else _key = `${_effect.type}:${_effect.key}`;

      let _item_data = { key: _key, value: _effect.value, inequality: _effect.formula, clustering: "" };
      _items[item_index].effects.push(_item_data);
    }

    this.setState({ items: _items });
    this.syncItemToOtherBuffs(_items);
  }

  checkDuplicateBuffClustering(target_buff: Buff | Item) {
    let isSet = false;
    let _count = 0;
    for (let _buff of this.state.charactor.buffs) {
      if (_buff.type != null && _buff.type === target_buff.type && _buff.clustering != null && _buff.clustering === target_buff.clustering) {
        _count += 1;
        if (_count > 1) isSet = true;
      }
    }
    return isSet;
  }

  render() {
    return (
      <div className="otherBuffs">
        <div className="buff-table">
          <div>
            {this.state.items.map((item, item_index) => (
              <div key={item_index} id={item.otherIndex} className={`buff ${this.checkDuplicateBuffClustering(item) ? "is-duplicated" : ""}`}>
                <div className="buff-name-cluster">
                  <div className="buff-name">
                    <button onClick={() => this.removeItem(item_index)}>×</button>
                    <AutocompleteOtherBuffInput
                      charactor={this.state.charactor}
                      candidates={this.candidateBuffs}
                      value={item.name}
                      items={this.state.items}
                      item_index={item_index}
                      onChange={(event: any) => this.handleNameChange(item_index, event)}
                      onSelected={(_buff: Buff) => this.selectBuffName(_buff, item_index)}
                    />
                  </div>
                  <div style={{ whiteSpace: "nowrap" }}>
                    {item.clustering != null && item.clustering !== "" && (
                      <span>
                        ({BUFF_TYPE_CONVERT_NAME[item.type]}:{item.clustering})
                      </span>
                    )}
                  </div>
                </div>

                <div className="effects">
                  {item.effects.map((effect, effect_index) => (
                    <div key={item_index + "_" + effect_index}>
                      <AutocompleteEffectInput
                        candidate_dict={ITEM_KEY_CONVERT_NAMES}
                        item_effect_key={this.state.items[item_index].effects[effect_index].key}
                        key={effect.key}
                        onChange={(text: string) => this.effectTypeChange(item_index, effect_index, text)}
                      />

                      <input
                        type="number"
                        placeholder="値"
                        step="0.1"
                        value={effect.value}
                        style={{ width: 50 }}
                        className={Number(effect.value) > 0 ? "positive" : ""}
                        onChange={(event) => this.handleEffectValueChange(item_index, effect_index, event)}
                      />

                      <select value={effect.inequality} onChange={(event) => this.handleEffectInequalityChange(item_index, effect_index, event)}>
                        {this.state.items[item_index].effects[effect_index].key.includes("regenerate") && (
                          <React.Fragment>
                            <option value="">【式】</option>
                            <option value="min">min</option>
                            <option value="sec">sec</option>
                          </React.Fragment>
                        )}
                        {!this.state.items[item_index].effects[effect_index].key.includes("regenerate") && (
                          <React.Fragment>
                            <option value="">【式】</option>
                            <option value="+">+</option>
                            <option value="*">*</option>
                          </React.Fragment>
                        )}
                      </select>
                      <button onClick={() => this.removeEffect(item_index, effect_index)}>×</button>
                    </div>
                  ))}
                  <button className="add-effect" onClick={() => this.addEffect(item_index)}>
                    バフに要素を追加する
                  </button>
                </div>
              </div>
            ))}
            <div className="add-buff">
              <button onClick={this.addItem}>バフを追加する</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

type AutocompleteOtherBuffProps = {
  charactor: Charactor;
  candidates: Buff[];
  value: string;
  items: any[];
  item_index: number;
  onChange?: any;
  onSelected?: any;
};
type AutocompleteOtherBuffState = { inputValue: string; filteredCandidate_list: Buff[]; showCandidates: boolean };
class AutocompleteOtherBuffInput extends React.Component<AutocompleteOtherBuffProps, AutocompleteOtherBuffState> {
  inputRef: React.RefObject<any> = React.createRef();

  constructor(props: AutocompleteOtherBuffProps) {
    super(props);

    this.state = {
      inputValue: props.value,
      filteredCandidate_list: [],
      showCandidates: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    console.log("App", this);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  }

  handleClickOutside(event: MouseEvent) {
    if (this.inputRef.current && !this.inputRef.current.contains(event.target as Node)) {
      // setShowCandidates(false);
      this.setState({ showCandidates: false });
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    this.setState({ inputValue: value });

    const filterd_candidates = this.props.candidates.filter((candidate) => {
      let cand_str = candidate.getOtherBuffsString();

      let isTarget = true;
      let value_splited = value.split(/[\s/]/);
      for (let _value of value_splited) {
        isTarget &&= candidate.name.toLowerCase().includes(_value.toLowerCase()) || cand_str.toLowerCase().includes(_value.toLowerCase());
      }

      return isTarget;
    });
    this.setState({
      filteredCandidate_list: filterd_candidates,
      showCandidates: true,
    });
    this.props.onChange(event);
  }

  render(): JSX.Element {
    return (
      <div ref={this.inputRef} className="autocomplete-input">
        <input
          type="search"
          placeholder="名前"
          className="search-buff"
          value={this.props.items[this.props.item_index].name}
          onChange={this.handleChange}
          onFocus={this.handleChange}
        />
        {this.state.showCandidates && (
          <CandidateOtherBuffList
            charactor={this.props.charactor}
            candidate_list={this.state.filteredCandidate_list}
            index={this.props.item_index}
            selectedCallback={(candidate: Buff) => {
              this.props.onSelected(candidate);
              this.setState({
                showCandidates: false,
              });
            }}
          />
        )}
      </div>
    );
  }
}

type CandidateOtherBuffListProps = { candidate_list: Buff[]; index: number; selectedCallback: any; charactor: Charactor };
type CandidateOtherBuffListState = any;
class CandidateOtherBuffList extends React.Component<CandidateOtherBuffListProps, CandidateOtherBuffListState> {
  constructor(props: { candidate_list: Buff[]; index: number; selectedCallback: any; charactor: Charactor }) {
    super(props);

    console.log("CandidateOtherBuffList", this);
  }
  // 既に使われているバフか既に使われているクラスのバフか判定する
  //  マスタリーの場合、スキル条件を満たしてなければ削除したい
  checkPreSetBuffClustering(target_buff: Buff | Item) {
    let isSet = false;
    for (let _buff of this.props.charactor.buffs) {
      if (target_buff.name === _buff.name) {
        isSet = true;
      }
      if (_buff.type != null && _buff.type === target_buff.type && _buff.clustering != null && _buff.clustering === target_buff.clustering) {
        isSet = true;
      }
    }
    return isSet;
  }

  render(): JSX.Element {
    return (
      <div className="CandidateList">
        <ul>
          {this.props.candidate_list.map((candidate) => (
            <li
              key={candidate.name}
              className={`${this.checkPreSetBuffClustering(candidate) ? "is-set" : ""}`}
              onClick={(e) => {
                this.props.selectedCallback(candidate);
              }}
            >
              <span className="name">{candidate.name}</span>
              <span className="type">
                ({BUFF_TYPE_CONVERT_NAME[candidate.type]}:{candidate.clustering})
              </span>
              <span className="ant">{candidate.getOtherBuffsString()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

type AutocompleteEffectProps = { candidate_dict: { [key: string]: string }; item_effect_key: string; onChange?: Function; onChangeText?: Function };
type AutocompleteEffectState = { inputValue: string; filteredCandidates: { [key: string]: string }; showCandidates: boolean };
class AutocompleteEffectInput extends React.Component<AutocompleteEffectProps, AutocompleteEffectState> {
  inputRef: React.RefObject<any> = React.createRef();

  constructor(props: AutocompleteEffectProps) {
    super(props);
    this.state = {
      inputValue: props.candidate_dict[props.item_effect_key],
      filteredCandidates: {},
      showCandidates: false,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    const handleClickOutside = (event: MouseEvent) => {
      if (this.inputRef.current && !this.inputRef.current.contains(event.target as Node)) {
        // setShowCandidates(false);
        this.setState({ showCandidates: false });
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }

  // useEffect(() => {
  //   setInputValue(candidates[value])
  // },[candidates, value]);

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    this.setState({ inputValue: value });

    const filtered_keys = Object.keys(this.props.candidate_dict).filter((key) => {
      let isTarget = true;
      let value_splited = value.split(/[\s/]/);
      for (let _value of value_splited) {
        isTarget &&= this.props.candidate_dict[key].toLowerCase().includes(_value.toLowerCase());
      }
      return isTarget;
    });

    let filterd_candidates: { [key: string]: string } = {};
    for (let filtered_key of filtered_keys) {
      filterd_candidates[filtered_key] = this.props.candidate_dict[filtered_key];
    }

    this.setState({
      filteredCandidates: filterd_candidates,
      showCandidates: true,
    });
  }

  render(): JSX.Element {
    return (
      <div ref={this.inputRef} className="autocomplete-input">
        <input
          type="search"
          placeholder="名前"
          className="search-buff"
          value={this.state.inputValue}
          onChange={this.handleChange}
          onFocus={this.handleChange}
        />
        {this.state.showCandidates && (
          <CandidateEffectList
            candidate_list={this.state.filteredCandidates}
            selectedCallback={(candidate_key: string) => {
              this.setState({
                inputValue: this.props.candidate_dict[candidate_key],
                showCandidates: false,
              });
              if (this.props.onChange) this.props.onChange(candidate_key);
              if (this.props.onChangeText) this.props.onChangeText(candidate_key);
            }}
          />
        )}
      </div>
    );
  }
}

type CandidateEffectListProps = { candidate_list: any; selectedCallback: Function };
type CandidateEffectListState = any;
class CandidateEffectList extends React.Component<CandidateEffectListProps, CandidateEffectListState> {
  render(): JSX.Element {
    return (
      <div className="CandidateList">
        <ul>
          {Object.keys(this.props.candidate_list).map((candidate_key) => (
            <li
              key={candidate_key}
              onClick={(e: any) => {
                this.props.selectedCallback(candidate_key);
              }}
            >
              <span>{this.props.candidate_list[candidate_key]}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
