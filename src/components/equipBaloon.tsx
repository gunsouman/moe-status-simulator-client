import "./equipTable.scss";

import React from "react";

import Charactor from "../class/charactor";
import Equip from "../class/equip";
import Buff from "../class/buff";
import Effect from "../class/effect";

import * as common from "../assets/common_lib";

type Props = {
  parent: any;
  focusEquip: Equip;
  ownedBuffs?: Buff[];
  equiped: Equip;
  charactor: Charactor;
  charactorPart?: string;
};

interface State {
  focusEquip: Equip | null;
  ownedBuffs?: Buff[];
  charactor: Charactor;
}
export default class EquipBaloon extends React.Component<Props, State> {
  my_ref: React.RefObject<HTMLDivElement>;
  parent: any;
  targetEquip: Equip;
  charactorPart: string;

  constructor(props: Props) {
    super(props);

    this.my_ref = React.createRef();
    this.parent = props.parent;
    this.targetEquip = props.focusEquip;
    this.charactorPart = props.charactorPart;

    this.state = {
      focusEquip: this.targetEquip,
      ownedBuffs: props.ownedBuffs || [],
      charactor: props.charactor,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Props) {
    // 親から渡されたデータAが変更された場合、子のstateにも反映する
    if (this.props.focusEquip !== this.state.focusEquip) {
      this.setState({ focusEquip: this.props.focusEquip });
    }
    if (this.props.ownedBuffs !== this.state.ownedBuffs) {
      this.setState({ ownedBuffs: this.props.ownedBuffs });
    }
  }

  setTopPosition(_top: number) {
    if (this.my_ref.current) {
      this.my_ref.current.style.top = _top + "px";
    }
  }

  setLeftPosition(_left: number) {
    if (this.my_ref.current) {
      this.my_ref.current.style.left = _left + "px";
    }
  }

  updateEquip(target_equip: Equip) {
    this.setState({ focusEquip: target_equip });
  }

  isDuplicatedBuff(targetEquip: Equip, targetBuff: Buff): string {
    let _is = "";
    for (let part_name in this.state.charactor.partEquipObj) {
      if (part_name === this.charactorPart) continue;
      if (this.state.charactor.partEquipObj[part_name] == null) continue;
      if (targetEquip === this.state.charactor.partEquipObj[part_name]) continue;

      for (let buff of this.state.charactor.partEquipObj[part_name].buffs) {
        if (buff === targetBuff || (buff.clustering != null && buff.clustering === targetBuff.clustering)) {
          console.log(this.props.focusEquip, this.props.equiped, this.state.charactor.partEquipObj[part_name], targetEquip);
          _is = "duplicated";
        }
      }
    }
    return _is;
  }

  isDuplicatedEffect(targetEquip: Equip, targetEffect: Effect): string {
    let _is = "";

    for (let part_name in this.state.charactor.partEquipObj) {
      if (part_name === this.charactorPart) continue;
      if (this.state.charactor.partEquipObj[part_name] == null) continue;
      if (targetEquip === this.state.charactor.partEquipObj[part_name]) continue;

      for (let _buff of this.state.charactor.partEquipObj[part_name].buffs) {
        for (let _effect of _buff.effects) {
          if (_effect.clustering != null && _effect.clustering === targetEffect.clustering) {
            _is = "duplicated";
          }
        }
      }
    }
    return _is;
  }

  render() {
    if (this.state.focusEquip == null) return <div></div>;
    let skill_str = "必要スキル:";
    for (let skill_name in this.state.focusEquip.必要スキル) {
      let val = this.state.focusEquip.必要スキル[skill_name];
      skill_str += skill_name + ":";
      skill_str += val + " ";
    }

    let status_str = "";
    for (let status_name in this.state.focusEquip.status_obj) {
      let val = this.state.focusEquip.status_obj[status_name];
      status_str += status_name + ":";
      status_str += val > 0 ? "+" : "";
      status_str += val + " ";
    }
    return (
      <div
        className="balloon equip"
        ref={this.my_ref}
        style={{
          display: this.state.focusEquip ? "block" : "none",
        }}
      >
        <div className="name">{this.state.focusEquip.name}</div>
        <div className="skill">{skill_str}</div>
        {this.state.focusEquip.MAX_ATK != null && <div>攻撃力:{this.state.focusEquip.MAX_ATK}</div>}
        {this.state.focusEquip.MAX_AC != null && <div>AC:{this.state.focusEquip.MAX_AC}</div>}
        {this.state.focusEquip.回避 != null && <div>回避:{this.state.focusEquip.回避}</div>}
        {this.state.focusEquip.攻撃間隔 != null && <div>攻撃間隔:{this.state.focusEquip.攻撃間隔}</div>}
        {this.state.focusEquip.射程 != null && <div>射程:{this.state.focusEquip.射程}</div>}
        {this.state.focusEquip.補正角 != null && <div>補正角:{this.state.focusEquip.補正角}</div>}
        {this.state.focusEquip.重さ != null && <div>重さ:{this.state.focusEquip.重さ}</div>}
        {this.state.focusEquip.特殊条件 != null && this.state.focusEquip.特殊条件.length > 0 && (
          <div>特殊条件:{this.state.focusEquip.特殊条件.join(" ")}</div>
        )}

        {status_str.length > 0 && (
          <React.Fragment>
            <div>---------------</div>
            <div className="status">{status_str}</div>
          </React.Fragment>
        )}
        {this.state.focusEquip.buffs.map((buff: Buff, i: number) => {
          let row = (
            <div key={common.generateUniqueIndex()}>
              <div>---------------</div>
              <div className={this.isDuplicatedBuff(this.state.focusEquip, buff)}>
                <div>{buff.name}</div>
                <div>{buff.text}</div>
                {buff.effects.map((Effect, j) => (
                  <div key={common.generateUniqueIndex()} className={this.isDuplicatedEffect(this.state.focusEquip, Effect)}>
                    {Effect.buffDataConvertToSentence()}
                  </div>
                ))}
              </div>
            </div>
          );
          return row;
        })}
      </div>
    );
  }
}
