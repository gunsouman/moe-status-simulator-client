import "./equipTable.scss";

import React from "react";

import Effect from "../class/effect";
import Buff from "../class/buff";

import * as common from "../assets/common_lib";

type Props = {
  parent: any;
  targetBuff: Buff;
};

interface State {
  targetBuff: Buff | null;
}
export default class BuffBaloon extends React.Component<Props, State> {
  my_ref: React.RefObject<HTMLDivElement>;
  parent: any;

  constructor(props: Props) {
    super(props);

    this.my_ref = React.createRef();
    this.parent = props.parent;

    this.state = {
      targetBuff: props.targetBuff,
    };
  }

  componentDidUpdate(prevProps: Props) {
    // 親から渡されたデータAが変更された場合、子のstateにも反映する
    if (this.props.targetBuff !== this.state.targetBuff) {
      this.setState({ targetBuff: this.props.targetBuff });
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

  updateBuff(target_buff: Buff) {
    this.setState({ targetBuff: target_buff });
  }

  render() {
    if (this.state.targetBuff == null) return <div></div>;
    return (
      <div
        className="balloon"
        ref={this.my_ref}
        style={{
          display: this.state.targetBuff ? "block" : "none",
        }}
      >
        <div className="name">{this.state.targetBuff.name}</div>

        {this.state.targetBuff.effects.map((Effect: Effect, i: number) => {
          return <div key={common.generateUniqueIndex()}>{Effect.buffDataConvertToSentence()}</div>;
        })}
      </div>
    );
  }
}
