import "./skillPicker.scss";

import React from "react";

import Charactor from "../class/charactor";
import configs from "../assets/configs";

interface Props {
  parent: any;
  charactor: Charactor;
  updateStatusCallback?: Function;
}
interface State {
  charactor: Charactor;
  isSkillOmission: boolean;
}

export default class SkillPicker extends React.Component<Props, State> {
  my_ref: React.RefObject<HTMLDivElement>;
  updateStatusCallback: Function;
  updateLimitter: boolean = false;

  constructor(props: Props) {
    super(props);

    this.updateStatusCallback = props.updateStatusCallback;

    this.state = {
      charactor: props.charactor,
      isSkillOmission: true,
    };
  }

  updateSkill = (skill_name: string, value: number) => {
    if (!this.updateLimitter) {
      const _charactor = this.state.charactor;
      _charactor.setSkillValue(skill_name, value);
      this.updateStatusCallback();
    }
    // this.forceUpdate();
  };

  updateLimitterFunc = () => {
    this.updateLimitter = true;
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        this.updateLimitter = false;
        resolve("ok");
      }, 1000 / 60);
    });
  };

  handleOnSkillChange = (event: React.ChangeEvent<HTMLInputElement>, skill_name: string) => {
    const value = event.target.value;
    this.updateSkill(skill_name, Number(value));
  };

  setSkillPickBar = (skill_name: string) => {
    return (
      <span key={"skill_picker_" + skill_name} className="skill-frame">
        <span style={{ width: 100, display: "inline-block" }}>{skill_name}</span>
        <input
          type="range"
          step="1"
          min="0"
          max="100"
          value={this.state.charactor.skillObj[skill_name]}
          onChange={(event) => this.handleOnSkillChange(event, skill_name)}
        />
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={this.state.charactor.skillObj[skill_name]}
          onChange={(event) => this.handleOnSkillChange(event, skill_name)}
        />
      </span>
    );
  };

  renderSkillPickers = () => {
    let skill_jsxs = (
      <React.Fragment>
        <div>戦闘</div>
        {
          <div key={"pickers_battle"} className="pickers">
            {configs.BATTLE_SKILL_NAMES.map((skill_name, i) => {
              return this.setSkillPickBar(skill_name);
            })}
          </div>
        }
        <div>熟練</div>
        {
          <div key={"pickers_experience"} className="pickers">
            {configs.EXPERIENCE_SKILL_NAMES.map((skill_name, i) => {
              return this.setSkillPickBar(skill_name);
            })}
          </div>
        }
        <div>基本</div>
        {
          <div key={"pickers_basic"} className="pickers">
            {configs.BASIC_SKILL_NAMES.map((skill_name, i) => {
              return this.setSkillPickBar(skill_name);
            })}
          </div>
        }
        <div>生産</div>
        {
          <div key={"pickers_product"} className="pickers">
            {configs.PRODUCT_SKILL_NAMES.map((skill_name, i) => {
              return this.setSkillPickBar(skill_name);
            })}
          </div>
        }
      </React.Fragment>
    );

    return skill_jsxs;
  };

  getTotalSkillPoint = () => {
    return this.state.charactor.getTotalSkillPoint();
  };

  renderTotalSkillPoint = () => {
    return <span>{this.getTotalSkillPoint()}</span>;
  };

  // useEffect(() => {
  //   function handleClickOutside(event: { target: any; }) {
  //     console.log("ref", ref)
  //     if (ref.current && !ref.current.contains(event.target)) {
  //       console.log('外側がクリックされました');
  //       props.parent.closeEquipTableModal()
  //     }
  //   }
  //   // クリックイベントを設定
  //   document.addEventListener('click', handleClickOutside);
  //   return () => {
  //     // イベントリスナーを削除
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, [props.parent, ref]);

  render() {
    return (
      <section className="skill-list" ref={this.my_ref}>
        <div className={`skills ${!this.state.isSkillOmission ? "active" : ""}`}>
          {this.state.isSkillOmission && <div className="gradation"></div>}
          <div className={`total-point ${this.getTotalSkillPoint() > 850 ? "over" : ""}`}>合計値：{this.renderTotalSkillPoint()}</div>
          {this.renderSkillPickers()}
        </div>
        <label
          id="skill-appear-toggle"
          onClick={() => {
            this.setState({ isSkillOmission: !this.state.isSkillOmission });
          }}
        >
          {!this.state.isSkillOmission ? "スキル省略" : "スキル表示"}
        </label>
      </section>
    );
  }
}
