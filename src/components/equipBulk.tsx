import "./equipBulk.scss";

import React from "react";
import TableEquip from "../class/tableEquip";

import configs from "../assets/configs";
import * as common from "../assets/common_lib";

import Buff from "../class/buff";
import Charactor from "../class/charactor";
import Equip from "../class/equip";

import EquipTable from "../components/equipTable";

// import LeftHandImage  from '../assets/img/left_hand.png';
// import RightHandImage  from '../assets/img/right_hand.png';

// import HeadArmorImage  from '../assets/img/head_armor.png';
// import BodyArmorImage  from '../assets/img/body_armor.png';
// import ArmArmorImage  from '../assets/img/arm_armor.png';
// import PantsArmorImage  from '../assets/img/pants_armor.png';
// import LegArmorImage  from '../assets/img/leg_armor.png';
// import ShoulderArmorImage  from '../assets/img/shoulder_armor.png';
// import WaistArmorImage  from '../assets/img/waist_armor.png';

// import HeadOrnamentImage  from '../assets/img/head_ornament.png';
// import FaceOrnamentImage  from '../assets/img/face_ornament.png';
// import EarOrnamentImage  from '../assets/img/ear_ornament.png';
// import FingerOrnamentImage  from '../assets/img/finger_ornament.png';
// import ChestOrnamentImage  from '../assets/img/chest_ornament.png';
// import BackOrnamentImage  from '../assets/img/back_ornament.png';
// import WaistOrnamentImage  from '../assets/img/waist_ornament.png';

// const CHARACTOR_PARTS_IMAGE_OBG:{[charactorPart:string]:any} = {
//   "左手":LeftHandImage,
//   "右手":RightHandImage,
//   "頭(防)":HeadArmorImage,
//   "胴(防)":BodyArmorImage,
//   "手(防)":ArmArmorImage,
//   "パンツ(防)":PantsArmorImage,
//   "靴(防)":LegArmorImage,
//   "肩(防)":ShoulderArmorImage,
//   "腰(防)":WaistArmorImage,
//   "頭(装)":HeadOrnamentImage,
//   "顔(装)":FaceOrnamentImage,
//   "耳(装)":EarOrnamentImage,
//   "指(装)":FingerOrnamentImage,
//   "胸(装)":ChestOrnamentImage,
//   "背中(装)":BackOrnamentImage,
//   "腰(装)":WaistOrnamentImage,
// }
const CHARACTOR_PARTS_IMAGE_OBG: { [charactorPart: string]: any } = {
  "左手": "./img/left_hand.png",
  "右手": "./img/right_hand.png",
  "矢/弾": "./img/left_hand.png",
  "頭(防)": "./img/head_armor.png",
  "胴(防)": "./img/body_armor.png",
  "手(防)": "./img/arm_armor.png",
  "パンツ(防)": "./img/pants_armor.png",
  "靴(防)": "./img/leg_armor.png",
  "肩(防)": "./img/shoulder_armor.png",
  "腰(防)": "./img/waist_armor.png",
  "頭(装)": "./img/head_ornament.png",
  "顔(装)": "./img/face_ornament.png",
  "耳(装)": "./img/ear_ornament.png",
  "指(装)": "./img/finger_ornament.png",
  "胸(装)": "./img/chest_ornament.png",
  "背中(装)": "./img/back_ornament.png",
  "腰(装)": "./img/waist_ornament.png",
};
interface Props {
  charactor: Charactor;
  parent: any;
  equips: Equip[];
}
interface State {
  charactor: Charactor;
  searchEquipText: string;
  searchBuffText: string;
  targetEquip_dict: { [key: string]: Equip };
  filters: any;
  searchTextEquipName: string;
  searchTextBuffInfo: string;
  onlyCritical: boolean;
  excludeCantMove: boolean;
  excludeCantTec: boolean;
  isOpenRequestSkillFilter: boolean;
}

type RequestSkills = { [skill_name: string]: { enable: boolean; min: number; max: number } };

export default class EquipBulk extends React.Component<Props, State> {
  my_ref: React.RefObject<HTMLDivElement>;
  draggedItem: any;
  equipBaloonJSX: JSX.Element;
  skillFilterRef: React.RefObject<any> = React.createRef();
  SkillFilterJSX: any;
  parent: any;
  equips: Equip[];
  equipTableRef_dict: { [equip_part: string]: React.RefObject<any> } = {};
  equipTableJSX_dict: { [equip_part: string]: JSX.Element | undefined } = {};
  charactor: Charactor;

  equipTextTimeoutId: NodeJS.Timeout;
  buffTextTimeoutId: NodeJS.Timeout;
  equipTextInputTime: number;
  buffTextTimeCount: number;

  candidates: string[] = [];
  requestSkills: RequestSkills = {};

  constructor(props: Props) {
    super(props);
    this.my_ref = React.createRef<HTMLDivElement>();
    this.parent = props.parent;
    this.equips = props.equips;
    this.charactor = props.charactor;

    let _targetEquip_dict: { [key: string]: Equip } = {};
    // configs.EQUIP_PARTS
    for (let _charactorPart of configs.EQUIP_CHARACTOR_PARTS) {
      _targetEquip_dict[_charactorPart] = null;
      this.equipTableRef_dict[_charactorPart] = React.createRef();
    }
    for (let _charactorPart in this.charactor.partEquipObj) {
      _targetEquip_dict[_charactorPart] = this.charactor.partEquipObj[_charactorPart];
    }

    this.getCandidates();
    this.getRequestSkills();

    this.state = {
      charactor: props.charactor,
      searchEquipText: "",
      searchBuffText: "",
      targetEquip_dict: _targetEquip_dict,
      filters: {},
      onlyCritical: false,
      excludeCantMove: false,
      excludeCantTec: false,
      searchTextEquipName: "",
      searchTextBuffInfo: "",
      isOpenRequestSkillFilter: false,
    };
    console.log("EquipBulk", this);

    this.setParentSortStatus = this.setParentSortStatus.bind(this);
    this.selectEquip = this.selectEquip.bind(this);
    this.setEquipTable = this.setEquipTable.bind(this);
    this.switchOnlyCritical = this.switchOnlyCritical.bind(this);
    this.switchExcludeCantMove = this.switchExcludeCantMove.bind(this);
    this.switchExcludeCantTec = this.switchExcludeCantTec.bind(this);
    this.handleSearchTextBuffChange = this.handleSearchTextBuffChange.bind(this);
    this.updateSearchText = this.updateSearchText.bind(this);
    this.updateSearchTextImmediate = this.updateSearchTextImmediate.bind(this);
    this.handleSearchTextEquipChange = this.handleSearchTextEquipChange.bind(this);
    this.closeRequestSkillFilterModal = this.closeRequestSkillFilterModal.bind(this);

    this.closeEquipBulk = this.closeEquipBulk.bind(this);

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  handleMouseMove(event: MouseEvent) {
    // テーブル外をマウスオーバーしたときにバルーンを削除する
    if (this.my_ref.current) {
      let isMouseOverTable = false;
      for (let charactor_part_name in this.equipTableRef_dict) {
        if (this.equipTableRef_dict[charactor_part_name].current.tableMasterRef.current.contains(event.target)) isMouseOverTable = true;
      }
      if (!isMouseOverTable) {
        for (let charactor_part_name in this.equipTableRef_dict) {
          if (this.equipTableRef_dict[charactor_part_name].current.baloonRef.current.my_ref.current)
            this.equipTableRef_dict[charactor_part_name].current.onMouseOut(event);
        }
      }
    }
  }

  getCandidates() {
    for (let _equip of this.equips) {
      for (let _buff of _equip.buffs) {
        if (_buff.name && this.candidates.indexOf(_buff.name) === -1) this.candidates.push(_buff.name);

        for (let _buffData of _buff.effects) {
          if (_buffData.key && this.candidates.indexOf(_buffData.key) === -1) this.candidates.push(_buffData.key);
        }
      }
    }
  }

  getRequestSkills() {
    for (let _equip of this.equips) {
      for (let _skill_name of Object.keys(_equip.必要スキル)) {
        if (this.requestSkills[_skill_name] == null) {
          this.requestSkills[_skill_name] = { enable: true, min: 0, max: 100 };
        }
      }
    }
  }

  setChildrenSortStatus(_sortStatus: { column: string; type: string }) {
    for (let _charactorPart of configs.EQUIP_CHARACTOR_PARTS) {
      if (this.equipTableRef_dict[_charactorPart].current) this.equipTableRef_dict[_charactorPart].current.setSortStatus(_sortStatus);
    }
    // _sortStatus
  }

  setParentSortStatus(_sortStatus: { column: string; type: string }) {
    if (this.parent) this.parent.setSortStatus(_sortStatus);
  }

  async selectEquip(_equip: Equip | null, _part: string) {
    let before_targetEquip_dict = this.state.targetEquip_dict;
    before_targetEquip_dict[_part] = _equip;

    await new Promise<void>((resolve) => {
      this.setState({ targetEquip_dict: before_targetEquip_dict }, () => {
        resolve();
      });
    });
    await this.parent.setGlobalEquip(_equip, _part);
  }

  setEquipTable(_charactorPart: string) {
    let filterdEquips: Equip[] = [];
    for (let equip of this.equips) {
      if (_charactorPart === "右手" && (equip.部位 === "右(1)" || equip.部位 === "右(2)" || equip.部位 === "右左(1)")) {
        filterdEquips.push(equip);
      }
      if (_charactorPart === "左手" && (equip.部位 === "左(1)" || equip.部位 === "左(2)" || equip.部位 === "右左(1)")) {
        filterdEquips.push(equip);
      }
      if (_charactorPart === equip.部位) {
        filterdEquips.push(equip);
      }
    }

    let sortStatus = { column: configs.EQUIP_TABLE_COLUMNS[0].accessor, type: "asc" };
    if (this.parent) {
      sortStatus = this.parent.state.sortStatus;
    }

    let _selectedCallback = async (_equip: Equip, _charactorPart: string) => {
      await this.selectEquip(_equip, _charactorPart);

      for (let _charactorPart of configs.EQUIP_CHARACTOR_PARTS) {
        if (this.equipTableRef_dict[_charactorPart].current) this.equipTableRef_dict[_charactorPart].current.updateTalbeEquipStatues();
      }
    };

    let _horizontalScrollCallback = (scrollLeft: number) => {
      for (let _charactorPart of configs.EQUIP_CHARACTOR_PARTS) {
        if (this.equipTableRef_dict[_charactorPart].current) this.equipTableRef_dict[_charactorPart].current.updateScroll(scrollLeft);
      }
    };

    let _max_num_text = "";
    for (let equip of this.equips) {
      //文字数が最も多いものを出力
      if (_max_num_text.length < equip.name.length) {
        _max_num_text = equip.name;
      }
    }
    this.equipTableJSX_dict[_charactorPart] = (
      <EquipTable
        ref={this.equipTableRef_dict[_charactorPart]}
        parent={this}
        equips={filterdEquips}
        targetEquip={this.state.targetEquip_dict[_charactorPart]}
        sortStatus={sortStatus}
        charactor={this.charactor}
        charactorPart={_charactorPart}
        max_num_text={_max_num_text}
        row_limit={10}
        selectedCallback={_selectedCallback}
        sortedCallback={(_sortStatus: { column: string; type: string }) => {
          this.setChildrenSortStatus(_sortStatus);
          this.setParentSortStatus(_sortStatus);
        }}
        horizontalScrollCallback={_horizontalScrollCallback}
      />
    );

    return this.equipTableJSX_dict[_charactorPart];
  }

  closeEquipBulk() {
    this.parent.closeEquipBulk();
  }

  handleSearchTextEquipChange(e: React.ChangeEvent<HTMLInputElement>) {
    let search_text = e.currentTarget.value;

    // 3秒以上テキスト入力がなければフィルタリングを反映させる
    clearTimeout(this.equipTextTimeoutId);
    this.equipTextInputTime = Date.now();

    this.equipTextTimeoutId = setTimeout(() => {
      if (this.equipTextInputTime < Date.now() + 3000) {
        this.updateEquipTable();
        clearTimeout(this.equipTextTimeoutId);
      }
    }, 1000);

    this.setState({ searchTextEquipName: search_text }, () => {});
  }

  handleSearchTextBuffChange(e: React.ChangeEvent<HTMLInputElement>) {
    let search_text = e.currentTarget.value;

    this.updateSearchText(search_text);
  }

  updateSearchText(_text: string) {
    console.log("updateSearchText", _text);

    // 3秒以上テキスト入力がなければフィルタリングを反映させる
    clearTimeout(this.equipTextTimeoutId);
    this.equipTextInputTime = Date.now();

    this.equipTextTimeoutId = setTimeout(() => {
      this.setState({ searchTextBuffInfo: _text }, () => {
        this.updateEquipTable();
      });
      clearTimeout(this.equipTextTimeoutId);
    }, 3000);
  }

  updateSearchTextImmediate(_text: string) {
    clearTimeout(this.equipTextTimeoutId);
    this.setState({ searchTextBuffInfo: _text }, () => {
      this.updateEquipTable();
    });
  }

  switchOnlyCritical() {
    this.setState({ onlyCritical: !this.state.onlyCritical }, () => {
      this.updateEquipTable();
    });
  }

  switchExcludeCantMove() {
    this.setState({ excludeCantMove: !this.state.excludeCantMove }, () => {
      this.updateEquipTable();
    });
  }

  switchExcludeCantTec() {
    this.setState({ excludeCantTec: !this.state.excludeCantTec }, () => {
      this.updateEquipTable();
    });
  }

  updateEquipTable() {
    let _criteria = this.buildCriteria();
    for (let equipTableRef_key in this.equipTableRef_dict) {
      if (this.equipTableRef_dict[equipTableRef_key].current) {
        this.equipTableRef_dict[equipTableRef_key].current.filteringEquipList(
          this.state.searchTextEquipName,
          this.state.searchTextBuffInfo,
          _criteria
        );
      }
    }
  }

  buildCriteria() {
    let _criteria = [];
    if (this.state.onlyCritical) {
      _criteria.push(TableEquip.getCriticalCriteria());
    }
    if (this.state.excludeCantMove) {
      _criteria.push(TableEquip.getExcludeCantMove());
    }
    if (this.state.excludeCantTec) {
      _criteria.push(TableEquip.getExcludeCantTec());
    }

    let range_befs: any = {};
    for (let _skill_name in this.requestSkills) {
      if (this.requestSkills[_skill_name].enable)
        range_befs["skill_obj." + _skill_name] = [this.requestSkills[_skill_name].min, this.requestSkills[_skill_name].max];
    }
    // let _match = {}
    // if(args_data_dict["match"])
    //     _match = common.buildMatch(args_data_dict["match"])

    // let _filter = {}
    // if(args_data_dict["filter"])
    //     _filter = common.buildFilter(args_data_dict["filter"])

    let _ranges: any = {};
    if (Object.keys(range_befs).length > 0) {
      _ranges = common.buildRange(range_befs);
      let __ranges: any = { $or: [] };
      for (let _range in _ranges) {
        __ranges["$or"].push({ [_range]: _ranges[_range] });
      }

      _criteria.push(__ranges);
      console.log(range_befs, __ranges);
    }

    console.log("_criteria", _criteria, JSON.stringify(_criteria));
    return { $and: _criteria };
  }

  closeRequestSkillFilterModal() {
    this.setState((currentState) => ({
      isOpenRequestSkillFilter: false,
      // isEquipOpen: !currentState.isEquipOpen
    }));
  }

  setRequestSkill(_requestSkills: RequestSkills) {
    this.requestSkills = _requestSkills;
    this.updateEquipTable();
  }

  render() {
    return (
      <div className="equipBulk" ref={this.my_ref}>
        <div className="header">
          <div className="filters">
            <div className="text">
              <AutocompleteInput
                candidates={this.candidates}
                onChange={this.updateSearchText}
                onClickCandidateList={this.updateSearchTextImmediate}
              />
              <SkillFilter
                ref={this.skillFilterRef}
                requestSkills={this.requestSkills}
                updateSkillData={(_requestSkills: RequestSkills) => {
                  this.setRequestSkill(_requestSkills);
                }}
              />
            </div>
            <div className="checks">
              <label htmlFor="filter-cantMove">
                <input type="checkbox" id="filter-cantMove" onChange={this.switchExcludeCantMove} />
                移動不可除く
              </label>
              <label htmlFor="filter-cantTec">
                <input type="checkbox" id="filter-cantTec" onChange={this.switchExcludeCantTec} />
                テクニック不可除く
              </label>
            </div>
            <div className="close-frame">
              <button className="close" onClick={this.closeEquipBulk}>
                一括設定を終了
              </button>
            </div>
          </div>
        </div>
        <div className="context">
          {configs.EQUIP_CHARACTOR_PARTS.map((equip_part: string, index: number) => (
            <div key={equip_part}>
              <h3>
                <img src={CHARACTOR_PARTS_IMAGE_OBG[equip_part]} alt={equip_part} />
                {equip_part}
              </h3>
              {this.setEquipTable(equip_part)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

class AutocompleteInput extends React.Component<
  { candidates: any[]; onChange?: Function; onClickCandidateList?: Function },
  { inputValue: string; filteredCandidates: Buff[]; showCandidates: boolean }
> {
  inputFrameRef: React.RefObject<any> = React.createRef();
  inputRef: React.RefObject<any> = React.createRef();
  constructor(props: { candidates: any[]; value: string; onChange?: Function; onChangeText?: Function }) {
    super(props);

    this.state = {
      inputValue: props.value,
      filteredCandidates: [],
      showCandidates: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);

    console.log("App", this);
  }

  async componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("keypress", this.handleKeypress);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("keypress", this.handleKeypress);
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.inputRef.current && !this.inputRef.current.contains(event.target as Node)) {
      // setShowCandidates(false);
      this.setState({ showCandidates: false });
    }
  };

  handleKeypress = (event: KeyboardEvent) => {
    if (this.inputRef.current && document.activeElement === this.inputRef.current) {
      if (event.key === "Enter") {
        this.props.onClickCandidateList(this.inputRef.current.value);
      }
    }
  };

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    this.changeValue(value);
  }

  changeValue(value: string) {
    const filtered = this.props.candidates.filter((candidate) => {
      let isTarget = true;
      let value_splited = value.split(/[\s/]/);
      for (let _value of value_splited) {
        isTarget &&= candidate.toLowerCase().includes(_value.toLowerCase());
      }

      return isTarget;
    });

    this.setState({
      filteredCandidates: filtered,
      showCandidates: true,
      inputValue: value,
    });

    console.log(value, this.state.inputValue);
    if (value === this.state.inputValue) return;
    this.props.onChange(value);
  }

  render(): JSX.Element {
    return (
      <div ref={this.inputFrameRef} className="autocomplete-input">
        <input
          type="search"
          ref={this.inputRef}
          placeholder="名前"
          className="search-buff"
          value={this.state.inputValue}
          onChange={this.handleChange}
          onFocus={this.handleChange}
        />
        {this.state.showCandidates && (
          <CandidateList
            candidate_list={this.state.filteredCandidates}
            selectedCallback={(text: string) => {
              this.setState({
                showCandidates: false,
                inputValue: text,
              });
              this.props.onClickCandidateList(text);
            }}
          />
        )}
      </div>
    );
  }
}

class CandidateList extends React.Component<{ candidate_list: any[]; selectedCallback: any }, any> {
  render(): JSX.Element {
    return (
      <div className="CandidateList">
        <ul>
          {this.props.candidate_list.map((candidate) => (
            <li
              key={candidate}
              onClick={(e: any) => {
                this.props.selectedCallback(e.target.outerText);
              }}
            >
              <span>{candidate}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

interface SkillFilterProps {
  requestSkills: RequestSkills;
  updateSkillData?: Function;
}

interface SkillFilterState {
  requestSkills: RequestSkills;
  isShowList?: boolean;
}

class SkillFilter extends React.Component<SkillFilterProps, SkillFilterState> {
  private inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: SkillFilterProps) {
    super(props);
    this.inputRef = React.createRef<HTMLInputElement>();
    this.state = {
      requestSkills: props.requestSkills,
      isShowList: false,
    };
  }

  handleToggleButtonClick = () => {
    this.setState((prevState) => ({
      isShowList: !prevState.isShowList,
    }));
  };

  handleAllSelect = () => {
    const _skillRangeValues = { ...this.state.requestSkills };
    for (let _skill_name in _skillRangeValues) {
      _skillRangeValues[_skill_name].enable = true;
    }
    this.setState({ requestSkills: _skillRangeValues });
  };

  handleClear = () => {
    const _skillRangeValues = { ...this.state.requestSkills };
    for (let _skill_name in _skillRangeValues) {
      _skillRangeValues[_skill_name].enable = false;
    }
    this.setState({ requestSkills: _skillRangeValues });
  };

  handleChangeSkillEnable = (event: React.ChangeEvent<HTMLInputElement>, _skill_name: string) => {
    const _skillRangeValues = {
      ...this.state.requestSkills,
      [_skill_name]: {
        ...this.state.requestSkills[_skill_name],
        enable: event.target.checked,
      },
    };
    this.setState({ requestSkills: _skillRangeValues });
  };

  handleChangeSkillRange = (event: React.ChangeEvent<HTMLInputElement>, _skill_name: string, _minmax: "min" | "max") => {
    const _skillRangeValues = {
      ...this.state.requestSkills,
      [_skill_name]: {
        ...this.state.requestSkills[_skill_name],
        [_minmax]: Number(event.target.value),
      },
    };
    this.setState({ requestSkills: _skillRangeValues });
  };

  handleClickOutside = (event: any) => {
    if (this.inputRef.current && !this.inputRef.current.contains(event.target)) {
      this.setState({ isShowList: false });
    }
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  render() {
    const { requestSkills, isShowList } = this.state;
    const requestSkillNames = Object.keys(requestSkills);

    return (
      <React.Fragment>
        <input type="button" className="open-request-skill" value="必要スキル設定" onClick={this.handleToggleButtonClick} />
        {isShowList && (
          <div ref={this.inputRef} className="skill-request-frame">
            <input type="button" value="全選択" onClick={this.handleAllSelect} />
            <input type="button" value="クリア" onClick={this.handleClear} />
            <input
              type="button"
              value="検索"
              onClick={(e) => {
                this.setState({ isShowList: false });
                this.props.updateSkillData?.(requestSkills);
              }}
            />

            <div className="request-skills">
              {requestSkillNames.map((skill_name, j) => (
                <div key={skill_name}>
                  <input
                    type="checkbox"
                    id={"skill-require-enable-" + skill_name}
                    checked={requestSkills[skill_name].enable}
                    onChange={(e) => {
                      this.handleChangeSkillEnable(e, skill_name);
                    }}
                  />
                  <label htmlFor={"skill-require-enable-" + skill_name}>{skill_name}</label>
                  min
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={requestSkills[skill_name].min}
                    onChange={(e) => {
                      this.handleChangeSkillRange(e, skill_name, "min");
                    }}
                  />
                  ～max
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={requestSkills[skill_name].max}
                    onChange={(e) => {
                      this.handleChangeSkillRange(e, skill_name, "max");
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
