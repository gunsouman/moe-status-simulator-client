import configs from "../assets/configs";
import Buff from "./buff";

export default class Equip {
  name: string = "";
  AC: { [key: string]: number | null } = {
    NG: null,
    HG: null,
    WAR: null,
    other: null,
    劣: null,
  };
  MAX_AC: number | null;
  ATK: { [key: string]: number | null } = {
    NG: null,
    HG: null,
    WAR: null,
    other: null,
    劣: null,
  };
  MAX_ATK: number | null;
  enchantment_buffs: any = {};
  exist_special_conds: any = {};
  // percentages:any = {}
  // percentages_2:any = {}
  resonance_buffs: any = {};
  silver_bullets: any = {};
  status_obj: { [key: string]: number } = {};
  回避: number = 0;
  必要スキル: { [key: string]: number } = {};
  攻撃間隔: number | null = null;
  射程: number = 0;
  補正角: number | null = null;
  部位: string = "";
  素材: string | null = null;
  重さ: number | null = null;
  others: string[] = [];
  特殊条件: string[] = [];
  type: string = "";
  備考: string = "";
  buff_names: string[] = []; // バフ名の一覧を取得
  buff_origins: any[] = [];
  buffs: Buff[] = [];

  simple_equip_type: string;

  constructor(equip: any, buff_obj: any) {
    // super(props);
    this.name = equip.name;

    this.ATK = {
      NG: equip["attack_NG"],
      HG: equip["attack_HG"],
      WAR: equip["attack_WAR"],
      other: equip["attack_OTHR"],
      劣: equip["attack_dmgd"],
    };
    this.MAX_ATK = Math.max(...Object.values(this.ATK));
    if (Object.values(this.ATK).every((value) => value === null)) this.MAX_ATK = null;

    this.AC = {
      NG: equip["AC_NG"],
      HG: equip["AC_HG"],
      WAR: equip["AC_WAR"],
      other: equip["AC_OTHR"],
      劣: equip["AC_dmgd"],
    };
    this.MAX_AC = Math.max(...Object.values(this.AC));
    if (Object.values(this.AC).every((value) => value === null)) this.MAX_AC = null;

    this.buff_names = equip["buffs"];
    this.enchantment_buffs = equip["enchantment_buffs"];
    this.exist_special_conds = equip["exist_special_conds"];
    // this.percentages = equip["percentages"]
    // this.percentages_2 = equip["percentages_2"]
    this.resonance_buffs = equip["resonance_buffs"];
    this.silver_bullets = equip["silver_bullets"];
    this.status_obj = equip["status"] || {};
    const convert_keys: { [key: string]: string } = { 最大HP: "HP" };
    for (let status_key in this.status_obj) {
      if (convert_keys[status_key] != null) {
        this.status_obj[convert_keys[status_key]] = this.status_obj[status_key];
        delete this.status_obj[status_key];
      }
    }
    this.回避 = equip["avoid"];

    let skill_obj: { [key: string]: number } = {};
    for (let skill_name in equip["require_skills"]) {
      if (configs.SKILL_NAMES.indexOf(skill_name) !== -1) {
        skill_obj[skill_name] = equip["require_skills"][skill_name];
      } else {
        console.log("必要スキルがおかしいです", this.name, equip, skill_name);
      }
    }

    this.必要スキル = skill_obj;
    this.攻撃間隔 = equip["interval"];
    this.射程 = equip["range"];
    this.補正角 = equip["angle"];
    this.部位 = equip["part"];
    this.素材 = equip["material"];
    this.重さ = equip["weight"];
    this.others = equip["others"];
    this.特殊条件 = equip["exist_sp_conds"];

    this.buff_origins = equip["buffs"];
    this.buffs = [];
    for (let buff_name of equip["buffs"]) {
      this.buffs.push(buff_obj[buff_name]);
    }
  }

  getBui() {
    return this.部位;
  }

  static convertJsonToEquip(_equipName: any, equip_obj: { [buff_name: string]: Equip }): Equip {
    return equip_obj[_equipName];
  }

  static convertJsonToEquipParts(_equipJsons: { [key: string]: any }, equip_obj: { [buff_name: string]: Equip }): { [part_name: string]: Equip } {
    let equips: { [part_name: string]: Equip } = {};
    for (let part_name in _equipJsons) {
      equips[part_name] = equip_obj[_equipJsons[part_name]];
    }

    return equips;
  }
}
