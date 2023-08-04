import "./equipTable.scss";

import React from "react";
import Mingo from "mingo";

import Charactor from "../class/charactor";
import Equip from "../class/equip";
import TableEquip from "../class/tableEquip";

import configs from "../assets/configs";
import * as common from "../assets/common_lib";

import EquipBaloon from "../components/equipBaloon";

const EQUIP_TABLE_COLUMNS = configs.EQUIP_TABLE_COLUMNS;
const DEFAULT_EQUIP_TABLE_COLUMN_NAMES = configs.DEFAULT_EQUIP_TABLE_COLUMN_NAMES;
const DEFAULT_TABLE_ROW_LIMIT = configs.DEFAULT_TABLE_ROW_LIMIT;

type Props = {
  parent: any;
  equips: Equip[];
  targetEquip: Equip;
  sortStatus: { column: string; type: string } | null;
  charactor: Charactor;
  charactorPart?: string;
  row_limit?: number;
  max_num_text?: string;
  selectedCallback?: Function;
  sortedCallback?: Function;
  horizontalScrollCallback?: Function;
  displayColumns?:String[]
};

interface State {
  appeardTableEquips: TableEquip[];
  sortStatus: { column: string; type: string };
  targetEquip: Equip | null;
  focusEquip: Equip | null;
  baloonXY: any;
  namePixelSize: number;
  charactor: Charactor;
}

export default class EquipTable extends React.Component<Props, State> {
  my_ref: React.RefObject<HTMLDivElement>;
  tableMasterRef: React.RefObject<HTMLDivElement>;
  sectionDom: any;
  tbodyDom: any;
  parent: any;
  max_num_text: string;
  charactorPart: string;
  row_limit: number;
  baloonRef: React.RefObject<EquipBaloon>;
  baloonJSX: any;
  scrollLeft: number;
  currentCond: {
    filter_equip_text: string;
    filter_buff_text: string;
    criteria: any;
  };
  originTableEquips: TableEquip[] = [];
  filterdTableEquips: TableEquip[] = [];
  resizeObserver: ResizeObserver;

  displayColumns: String[];

  constructor(props: Props) {
    super(props);
    this.my_ref = React.createRef<HTMLDivElement>();
    this.tableMasterRef = React.createRef<HTMLDivElement>();
    this.baloonRef = React.createRef<EquipBaloon>();
    this.parent = props.parent;
    this.charactorPart = props.charactorPart;
    this.max_num_text = "";
    this.row_limit = props.row_limit ? props.row_limit : DEFAULT_TABLE_ROW_LIMIT;

    for (let equip of this.props.equips) {
      this.originTableEquips.push(new TableEquip(equip, this.charactorPart));

      if (props.max_num_text == null) {
        //文字数が最も多いものを出力
        if (this.max_num_text.length < equip.name.length) {
          this.max_num_text = equip.name;
        }
      } else {
        this.max_num_text = props.max_num_text;
      }
    }

    this.displayColumns = props.displayColumns||DEFAULT_EQUIP_TABLE_COLUMN_NAMES
    

    this.currentCond = {
      filter_equip_text: "",
      filter_buff_text: "",
      criteria: null,
    };

    this.scrollLeft = 0;

    this.state = {
      appeardTableEquips: [],
      sortStatus: { column: configs.EQUIP_TABLE_COLUMNS[0].accessor, type: "asc" },
      targetEquip: props.targetEquip,
      charactor: props.charactor,
      focusEquip: null,
      baloonXY: { x: 0, y: 0 },
      namePixelSize: 0,
    };

    this.getSortedTableEquips = this.getSortedTableEquips.bind(this);
    this.selectEquip = this.selectEquip.bind(this);
    this.handleChangeSorting = this.handleChangeSorting.bind(this);
    this.setSortStatus = this.setSortStatus.bind(this);
    this.filteringEquipList = this.filteringEquipList.bind(this);
    this.reFilteringEquipList = this.reFilteringEquipList.bind(this);
    this.trackScrolling = this.trackScrolling.bind(this);
    this.trackResize = this.trackResize.bind(this);
    this.addAppeardTableEquips = this.addAppeardTableEquips.bind(this);
    this.updateTalbeEquipStatues = this.updateTalbeEquipStatues.bind(this);
  }

  componentDidMount() {
    const element = document.getElementById("text-count-checker");
    this.setState({ namePixelSize: element.offsetWidth });

    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        this.trackResize(entry);
      });
    });

    this.resizeObserver.observe(this.my_ref.current);

    this.updateTalbeEquipStatues();
    this.filterdTableEquips = this.originTableEquips;

    this.setSortStatus(this.props.sortStatus ? this.props.sortStatus : { column: configs.EQUIP_TABLE_COLUMNS[0].accessor, type: "asc" });

    this.setState({
      targetEquip: this.props.targetEquip,
      focusEquip: null,
      baloonXY: { x: 0, y: 0 },
    });
  }

  componentWillUnmount() {
    this.setState({
      focusEquip: null,
    });
    this.resizeObserver.unobserve(this.my_ref.current);
  }

  selectEquip = async (e: React.UIEvent<HTMLElement>, equipName: string) => {
    let _equip = this.props.equips.find((_equip) => _equip.name === equipName);
    if (this.state.targetEquip === _equip) _equip = null; // 装備が同じものをクリックした場合は削除する
    this.setState({ targetEquip: _equip });
    await this.props.selectedCallback(_equip, this.charactorPart);
  };

  handleChangeSorting = (column: string) => {
    const isAsc = this.state.sortStatus.type === "asc";
    let _sortStatus = { column: column, type: isAsc ? "desc" : "asc" };

    this.setSortStatus(_sortStatus);
    this.props.sortedCallback(_sortStatus);
  };

  setSortStatus(_sortStatus: { column: string; type: string }) {
    let _filterdTableEquips = this.getSortedTableEquips(this.filterdTableEquips, _sortStatus);
    this.filterdTableEquips = _filterdTableEquips;
    this.setState({
      appeardTableEquips: _filterdTableEquips.slice(0, this.row_limit),
      sortStatus: _sortStatus,
    });
  }

  //引数のtableRquipをソート 装備済みのアイテムが存在すればそれを一番上にする
  getSortedTableEquips(_tableEquips: TableEquip[], _sortStatus: { column: string; type: string }) {
    let sorted_tableEquips: TableEquip[] = [];

    for (let tableEquip of _tableEquips) {
      sorted_tableEquips.push(tableEquip);
    }

    if (sorted_tableEquips.length === 0) return [];

    let column = _sortStatus.column;
    if (column === "必要スキル") {
      sorted_tableEquips.sort((a, b) =>
        a.equipStatus[column][0] > b.equipStatus[column][0] ? (_sortStatus.type === "asc" ? 1 : -1) : _sortStatus.type === "asc" ? -1 : 1
      );
    } else if (typeof sorted_tableEquips[0].equipStatus[column] == "object")
      sorted_tableEquips.sort((a, b) =>
        a.equipStatus[column].total > b.equipStatus[column].total ? (_sortStatus.type === "asc" ? 1 : -1) : _sortStatus.type === "asc" ? -1 : 1
      );
    else
      sorted_tableEquips.sort((a, b) =>
        a.equipStatus[column] > b.equipStatus[column] ? (_sortStatus.type === "asc" ? 1 : -1) : _sortStatus.type === "asc" ? -1 : 1
      );

    if (this.state.targetEquip) {
      let self = this;
      sorted_tableEquips.sort(function (a, b) {
        return a.name === self.state.targetEquip.name ? -1 : b.name === self.state.targetEquip.name ? 1 : 0;
      });
    }

    return sorted_tableEquips;
  }

  // 現在表示中のtableEquipのstatus情報を更新
  updateTalbeEquipStatues() {
    //2ハンド武器の計算に失敗している模様
    for (let tableEquip of this.originTableEquips) {
      tableEquip.updateStatus(this.state.charactor);
    }
    this.forceUpdate();
  }

  // 改修が必要 第一引数は正規表現、第二引数はmongodbに使われる検索表現
  filteringEquipList(filter_equip_text: string = "", filter_buff_text: string = "", _criteria: any = null) {
    let _filterdTableEquips: TableEquip[] = [];

    this.updateTalbeEquipStatues();

    let and_query = [];

    this.currentCond = {
      filter_equip_text: filter_equip_text,
      filter_buff_text: filter_buff_text,
      criteria: _criteria,
    };

    if (filter_equip_text !== "" || filter_buff_text !== "") {
      let __criteria = TableEquip.convertTextToEquipTableCriteria(filter_equip_text, filter_buff_text);
      and_query.push(__criteria);
    }

    if (_criteria) {
      and_query.push(_criteria);
    }

    if (and_query.length > 0) {
      let criteria: any = { $and: and_query };
      if (this.state.targetEquip) {
        let targetCond = { name: this.state.targetEquip.name };
        criteria = { $or: [criteria, targetCond] };
      }

      const collection = this.originTableEquips;
      let cursor = Mingo.find(collection, criteria);
      console.log(criteria, cursor);
      for (let value of cursor) {
        let res_TableEquips: TableEquip = value as TableEquip;
        _filterdTableEquips.push(res_TableEquips);
      }
    } else {
      for (let tableEquip of this.originTableEquips) {
        _filterdTableEquips.push(tableEquip);
      }
    }

    _filterdTableEquips = this.getSortedTableEquips(_filterdTableEquips, this.state.sortStatus);

    this.filterdTableEquips = _filterdTableEquips;
    this.setState({
      appeardTableEquips: _filterdTableEquips.slice(0, this.row_limit),
    });
  }

  reFilteringEquipList() {
    this.filteringEquipList(this.currentCond.filter_equip_text, this.currentCond.filter_buff_text, this.currentCond.criteria);
  }

  /**テキストを元に対象の装備の中に要求するバフが存在するか確認 */
  checkBuffInEquip(_tableEquip: TableEquip, filter_buff_name_text: string): boolean {
    return false;
  }

  // 横スクロールが発生したとき、コールバックを返す（他のテーブルもスクロールするのに用いる
  trackScrolling = (event: any) => {
    this.trackResize(event);

    const isHorizontalScroll = this.scrollLeft !== event.currentTarget.scrollLeft;

    this.scrollLeft = event.currentTarget.scrollLeft;
    if (isHorizontalScroll && this.props.horizontalScrollCallback) {
      this.props.horizontalScrollCallback(this.scrollLeft);
    }
  };

  // リサイズ字の処理
  trackResize = (event: any) => {
    let targetElem = event.currentTarget
    if (event.target) targetElem = event.target;
    const _scrollTop = targetElem.scrollTop;
    const _offsetHeight = targetElem.offsetHeight;
    const child_scrollHeight = targetElem.getElementsByClassName("equipTable")[0].scrollHeight;
    if (child_scrollHeight < _scrollTop + _offsetHeight) {
      this.addAppeardTableEquips();
    }
  };

  // 表示中のテーブルを追加する
  addAppeardTableEquips() {
    console.log("update");
    let new_table = this.state.appeardTableEquips.concat(
      this.filterdTableEquips.slice(this.state.appeardTableEquips.length, this.state.appeardTableEquips.length + this.row_limit)
    );
    this.setState((prevState) => ({
      appeardTableEquips: new_table,
    }));
  }

  updateScroll = (scrollLeft: number) => {
    console.log(this.charactorPart, this.tableMasterRef);

    if (this.tableMasterRef.current) this.tableMasterRef.current.scrollLeft = scrollLeft;
  };

  onMouseMove(event: React.MouseEvent<any>) {
    if (!(event.target instanceof Element)) return;

    if (this.baloonRef.current && this.baloonRef.current.my_ref.current) {
      this.baloonRef.current.setTopPosition(window.scrollY + event.clientY);
      this.baloonRef.current.setLeftPosition(window.scrollX + event.clientX + 20);
    }
  }

  onMouseEnter(event: any) {
    let elements = [].slice.call(event.target.closest("tbody").children);
    let index = elements.indexOf(event.target.closest("tr"));
    let _targetEquip = this.state.appeardTableEquips[index].targetEquip;

    this.setState({
      focusEquip: _targetEquip,
    });
  }

  onMouseOut(event: any) {
    if (this.baloonRef.current) {
      this.baloonRef.current.updateEquip(null);
    }
    this.setState({
      focusEquip: null,
    });
  }

  onFocus(event: any, tableEquip: TableEquip) {
    let elements = [].slice.call(event.target.closest("tbody").children);
    let target_element = event.target.closest("tr");
    let index = elements.indexOf(target_element);
    let _targetEquip = this.state.appeardTableEquips[index].targetEquip;

    if (this.baloonRef.current) {
      this.baloonRef.current.updateEquip(_targetEquip);

      // if(this.baloonRef.current.my_ref.current){
      //   this.baloonRef.current.setTopPosition(target_element.getBoundingClientRect().top)
      //   this.baloonRef.current.setLeftPosition(200)
      // }
    }

    this.setState({
      focusEquip: _targetEquip,
    });
  }

  handleKeyDown(event: any, i: number, tableEquip: TableEquip) {
    console.log(event.key, tableEquip, this.state.focusEquip);
    if (event.key === "Enter") {
      // Enterキーが押されたときに実行したい処理を記述する
      this.selectEquip(event, tableEquip.name);
    }
  }

  // 値を比較して一つ目が二つ目より大きければplus小さければminus
  checkPlusMinus(num1: number, num2: number) {
    if (num1 - num2 > 0) {
      return "plus";
    } else if (num1 - num2 < 0) {
      return "minus";
    } else {
      return null;
    }
  }

  render() {
    return (
      <section
        className="equipTableSection"
        ref={this.my_ref}
        onMouseLeave={(e) => {
          this.onMouseOut(e);
        }}
      >
        <span id="text-count-checker" style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
          {this.max_num_text}
        </span>
        <EquipBaloon
          ref={this.baloonRef}
          parent={this}
          focusEquip={this.state.focusEquip}
          charactor={this.state.charactor}
          ownedBuffs={this.state.charactor.buffs}
          equiped={this.state.targetEquip}
          charactorPart={this.charactorPart}
        />

        <div className="tableMaster modalTable" ref={this.tableMasterRef} onScroll={this.trackScrolling} onResize={this.trackResize}>
          <table className="equipTable">
            <thead>
              <tr>
                {EQUIP_TABLE_COLUMNS.map((column) => (
                  <th key={"EQUIP_TABLE_HEADER_" + column["accessor"]}>
                    <div
                      className={column["className"]}
                      onClick={() => this.handleChangeSorting(column["accessor"])}
                      style={{ width: column["Header"] === "Name" ? this.state.namePixelSize : "" }}
                    >
                      {column["Header"]}
                      {this.state.sortStatus.column === column["accessor"] ? (this.state.sortStatus.type === "desc" ? " ▼" : " ▲") : " 　"}
                    </div>
                  </th>
                ))}
                {/* <th>スキル</th> */}
              </tr>
            </thead>
            <tbody
              onMouseMove={(e) => {
                this.onMouseMove(e);
              }}
            >
              {this.state.appeardTableEquips.map((tableEquip: TableEquip, i: number) => {
                let row = (
                  <tr
                    key={"EQUIP_TABLE_ROW_" + i}
                    className={`${
                      (this.state.targetEquip != null && this.state.targetEquip.name === tableEquip.name)
                        ? "target"
                        : ""
                    } ${
                      (this.state.focusEquip != null && this.state.focusEquip.name === tableEquip.name)
                        ? "focus"
                        : ""
                    }`}
                    tabIndex={0}
                    onMouseUp={(e) => this.selectEquip(e, tableEquip.name)}
                    // onTouchEnd={(e) => this.selectEquip(e, tableEquip.name)}
                    onTouchStart={(e) => this.onFocus(e, tableEquip)}
                    onMouseEnter={(e) => {
                      this.onMouseEnter(e);
                    }}
                    onFocus={(e) => {
                      this.onFocus(e, tableEquip);
                    }}
                    onMouseLeave={(e) => {
                      this.onMouseOut(e);
                    }}
                    onKeyDown={(e) => this.handleKeyDown(e, i, tableEquip)}
                  >
                    {EQUIP_TABLE_COLUMNS.map((column, j) => (
                      <td key={"EQUIP_TABLE_ROW_COLUMNS" + i + "_" + j}>
                        {["必要スキル"].indexOf(column.accessor) !== -1 ? (
                          tableEquip.equipStatus["必要スキル_strs"].map((_value: any) => (
                            <div key={common.generateUniqueIndex()}>{_value}</div>
                          ))
                        ) : column.type === "number" ? (
                          <span
                            key={common.generateUniqueIndex()}
                            className={`${this.checkPlusMinus(
                              tableEquip.getStatusTotal(column.accessor),
                              this.state.charactor.status[column.accessor]
                            )}`}
                          >
                            {tableEquip.getStatusTotal(column.accessor)}
                          </span>
                        ) : (
                          <span key={common.generateUniqueIndex()}>{tableEquip.getValue(column.accessor)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
                return row;
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
