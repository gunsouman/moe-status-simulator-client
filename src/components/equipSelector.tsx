import "./equipSelector.scss";
import React from "react";

import Equip from "../class/equip";
import Charactor from "../class/charactor";
import configs from "../assets/configs";

import EquipTable from "../components/equipTable";
import EquipBaloon from "../components/equipBaloon";

interface Props {
  parent: any;
  name: string;
  charactorPart: string;
  equips: Equip[];
  charactor: Charactor;
  selectEquipCallback?: Function;
  setSortStatusCallback?: Function;
}
interface State {
  isEquipOpen: boolean;
  searchEquipText: string;
  charactor: Charactor;
  baloonXY: any;
  isEquipOver: boolean;
}

export default class EquipSelector extends React.Component<Props, State> {
  name: string = "";
  charactorPart: string = "";
  position: string = "";
  parent: any;
  equips: Equip[] = [];
  targetEquip: Equip | null;
  // equipBaloonJSX: JSX.Element;
  baloonRef: React.RefObject<EquipBaloon>;
  filterdEquips: Equip[] = [];
  equipTableRef: React.RefObject<any>;
  equipTableJSX: JSX.Element | undefined;
  searchEquipText: string = "";
  isEquipOpen: boolean = false;
  limit: number = 30;
  constructor(props: Props) {
    super(props);

    this.name = props.name;
    this.charactorPart = props.charactorPart;

    this.parent = props.parent;
    this.equips = props.equips;

    this.state = {
      isEquipOpen: false,
      searchEquipText: "",
      charactor: props.charactor,
      baloonXY: { x: 0, y: 0 },
      isEquipOver: false,
    };

    this.filterdEquips = props.equips;

    this.targetEquip = null;
    this.baloonRef = React.createRef<EquipBaloon>();

    this.openEquipTableModal = this.openEquipTableModal.bind(this);
    this.closeEquipTableModal = this.closeEquipTableModal.bind(this);
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.selectEquip = this.selectEquip.bind(this);
    this.setParentSortStatus = this.setParentSortStatus.bind(this);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);

    this.equipTableRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
    this.selectEquip(this.state.charactor.partEquipObj[this.charactorPart]);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  }

  updateEquip() {
    this.targetEquip = this.state.charactor.partEquipObj[this.charactorPart];
  }

  selectEquip(equip: Equip | null) {
    this.setState({ searchEquipText: "" });
    this.targetEquip = equip;

    this.parent.setGlobalEquip(equip, this.charactorPart);
  }

  openEquipTableModal(e: any) {
    console.log("openEquipTableModal", this);
    this.parent.closeModals();
    this.setState((currentState) => ({
      isEquipOpen: true,
    }));
  }

  closeEquipTableModal() {
    console.log("closeEquipTableModal");
    this.setState((currentState) => ({
      isEquipOpen: false,
    }));
  }

  handleSearchTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    let search_text = e.currentTarget.value;
    this.setState({ searchEquipText: search_text });
    if (this.equipTableRef.current) this.equipTableRef.current.filteringEquipList(search_text);
  }

  renderEquipTable() {
    this.filterdEquips = [];
    for (let equip of this.equips) {
      if (this.charactorPart === "右手" && (equip.部位 === "右(1)" || equip.部位 === "右(2)" || equip.部位 === "右左(1)")) {
        this.filterdEquips.push(equip);
      }
      if (this.charactorPart === "左手" && (equip.部位 === "左(1)" || equip.部位 === "左(2)" || equip.部位 === "右左(1)")) {
        this.filterdEquips.push(equip);
      }
      if (this.charactorPart === equip.部位) {
        this.filterdEquips.push(equip);
      }
    }

    let sortStatus = { column: configs.EQUIP_TABLE_COLUMNS[0].accessor, type: "asc" };
    if (this.parent) {
      sortStatus = this.parent.state.sortStatus;
    }

    let _selectedCallback = (_equip: Equip, part: string) => {
      this.selectEquip(_equip);
      this.closeEquipTableModal();
    };
    this.equipTableJSX = (
      <EquipTable
        ref={this.equipTableRef}
        parent={this}
        equips={this.filterdEquips}
        targetEquip={this.targetEquip}
        sortStatus={sortStatus}
        charactor={this.state.charactor}
        charactorPart={this.charactorPart}
        row_limit={30}
        selectedCallback={_selectedCallback}
        sortedCallback={this.setParentSortStatus}
      />
    );

    return this.equipTableJSX;
  }

  setParentSortStatus(_sortStatus: { [coluumn: string]: string }) {
    this.props.setSortStatusCallback(_sortStatus);
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.equipTableJSX == null) return;
    if (!(event.target instanceof Element)) return;

    if (
      this.equipTableRef &&
      this.equipTableRef.current &&
      this.equipTableRef.current.my_ref.current &&
      !this.equipTableRef.current.my_ref.current.contains(event.target) &&
      !event.target.classList.contains("searchEquip")
    ) {
      console.log("外側がクリックされました");
      this.closeEquipTableModal();
    }
  };

  clearEquip(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    this.selectEquip(null);
  }

  mouseOver(e: any) {}

  onMouseMove(event: React.MouseEvent<any>) {
    if (!(event.target instanceof Element)) return;
    if (this.baloonRef.current && this.baloonRef.current.my_ref.current) {
      this.baloonRef.current.setTopPosition(window.scrollY + event.clientY);
      this.baloonRef.current.setLeftPosition(window.scrollX + event.clientX + 20);
    }
  }

  onMouseEnter(event: any) {
    if (this.baloonRef.current) {
      this.baloonRef.current.updateEquip(this.targetEquip);

      if (this.baloonRef.current.my_ref.current) {
        this.baloonRef.current.setTopPosition(window.scrollY + event.clientY);
        this.baloonRef.current.setLeftPosition(window.scrollX + event.clientX + 20);
      }
    }

    this.setState({
      isEquipOver: true,
    });
  }

  onMouseOut(event: any) {
    if (this.baloonRef.current) {
      this.baloonRef.current.updateEquip(null);
    }
    this.setState({
      isEquipOver: false,
    });
  }

  render() {
    return (
      <div className="equipSelector">
        <article
          className={"equipmentFrame " + this.position}
          onMouseMove={(e) => {
            this.onMouseMove(e);
          }}
          onMouseEnter={(e) => {
            this.onMouseEnter(e);
          }}
          onMouseLeave={(e) => {
            this.onMouseOut(e);
          }}
          onBlur={(e) => {
            this.onMouseOut(e);
          }}
        >
          <EquipBaloon
            ref={this.baloonRef}
            parent={this}
            focusEquip={this.state.isEquipOver ? this.targetEquip : null}
            charactor={this.state.charactor}
            ownedBuffs={this.state.charactor.buffs}
            equiped={this.targetEquip}
          />
          <div className="title">{this.name}</div>
          <div className="equipInfo">
            {this.targetEquip && this.state.charactor.partEquipObj[this.charactorPart] && (
              <>
                <div className="equipNameFrame">
                  <span
                    className="clearEquip"
                    onClick={(e) => {
                      this.clearEquip(e);
                    }}
                  >
                    ×
                  </span>
                  <div className="equipName">{this.targetEquip.name}</div>
                </div>
                <div className="equipStatus">
                  {["左手", "右手"].indexOf(this.charactorPart) !== -1 && Object.keys(this.targetEquip.必要スキル).indexOf("盾") === -1 && (
                    <React.Fragment>ATK:{this.targetEquip.MAX_ATK}&nbsp;</React.Fragment>
                  )}
                  {["左手", "右手"].indexOf(this.charactorPart) !== -1 && Object.keys(this.targetEquip.必要スキル).indexOf("盾") === -1 && (
                    <React.Fragment>攻撃間隔:{this.targetEquip.攻撃間隔}&nbsp;</React.Fragment>
                  )}
                  {(["左手", "右手"].indexOf(this.charactorPart) === -1 || Object.keys(this.targetEquip.必要スキル).indexOf("盾") !== -1) && (
                    <React.Fragment>AC:{this.targetEquip.MAX_AC}&nbsp;</React.Fragment>
                  )}
                  {Object.keys(this.targetEquip.必要スキル).indexOf("盾") !== -1 && (
                    <React.Fragment>回避:{this.targetEquip.回避}&nbsp;</React.Fragment>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="inputEquip">
            <input
              type="search"
              id="name"
              name="name"
              autoComplete="off"
              size={25}
              className={`searchEquip ${this.state.isEquipOpen ? "focus" : ""}`}
              value={this.state.searchEquipText}
              placeholder="装備の名前を入力してください"
              onChange={this.handleSearchTextChange}
              onFocus={this.openEquipTableModal}
            />
          </div>
        </article>
        {this.state.isEquipOpen && this.renderEquipTable()}
      </div>
    );
  }
}
