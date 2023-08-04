import "./otherBuff.scss";

import React from "react";
import Buff from "../class/buff";
import Charactor from "../class/charactor";

import BuffBaloon from "../components/buffBaloon";

interface Props {
  charactor: Charactor;
}
interface State {
  charactor: Charactor;
  overBuff: Buff | null;
  baloonXY: any;
}

export default class EquipSelector extends React.Component<Props, State> {
  draggedItem: any;
  baloonRef: React.RefObject<BuffBaloon>;
  baloonJSX: JSX.Element;
  constructor(props: Props) {
    super(props);

    this.baloonRef = React.createRef<BuffBaloon>();

    this.state = {
      charactor: props.charactor,
      overBuff: null,
      baloonXY: { x: 0, y: 0 },
    };
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  handleDragStart(event: React.DragEvent<HTMLDivElement>, index: number) {
    this.draggedItem = this.state.charactor.buffs[index];
    event.dataTransfer.effectAllowed = "move";
    console.log(this.state);
  }

  handleDragOver(index: number) {
    const draggedOverItem = this.state.charactor.buffs[index];

    if (this.draggedItem === draggedOverItem) {
      return;
    }

    const new_buffs = this.state.charactor.buffs.filter((item) => item !== this.draggedItem);

    new_buffs.splice(index, 0, this.draggedItem);

    const _charactor = this.state.charactor;
    _charactor.buffs = new_buffs;
    this.setState({ charactor: _charactor });
  }

  handleDrop(e: { preventDefault: () => void }) {
    e.preventDefault();
  }

  onMouseMove(event: React.MouseEvent<any>) {
    if (!(event.target instanceof Element)) return;
    if (this.baloonRef.current && this.baloonRef.current.my_ref.current) {
      let _element = this.baloonRef.current.my_ref.current;
      _element.style.top = window.scrollY + event.clientY + "px";
      _element.style.left = window.scrollX + event.clientX + 20 + "px";
    }
  }

  onMouseEnter(event: any) {
    let elements = [].slice.call(event.target.closest("ul").children);
    let index = elements.indexOf(event.target.closest("li"));
    let _targetEquip = this.state.charactor.buffs[index];
    this.setState({
      overBuff: _targetEquip,
    });

    if (this.baloonRef.current) {
      this.baloonRef.current.setTopPosition(window.scrollY + event.clientY);
      this.baloonRef.current.setLeftPosition(window.scrollX + event.clientX + 20);
    }
  }

  onMouseOut(e: any) {
    console.log("onMouseOut");
    // if(this.baloonRef.current){
    //   this.baloonRef.current.updateBuff(null)
    // }
    this.setState({
      overBuff: null,
    });
    console.log("XXXX", this.baloonRef.current);
  }

  componentDidMount() {
    console.log("component mounted");
  }

  render() {
    return (
      <React.Fragment>
        {/* {this.state.overBuff && this.setBaloon()} */}
        <BuffBaloon ref={this.baloonRef} parent={this} targetBuff={this.state.overBuff} />
        <ul
          className="bufflist"
          onMouseMove={(e) => {
            this.onMouseMove(e);
          }}
          onMouseLeave={(e) => {
            this.onMouseOut(e);
          }}
        >
          {this.state.charactor.buffs.map((_buff, index) => (
            <li
              key={_buff.name + index}
              // onMouseOut={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                this.onMouseEnter(e);
              }}
              onDragOver={() => this.handleDragOver(index)}
            >
              <div onDragStart={(e) => this.handleDragStart(e, index)} onDrop={this.handleDrop} draggable>
                {_buff.name}
              </div>
            </li>
          ))}
        </ul>
      </React.Fragment>
    );
  }
}
