export default class saveData {
  id: number;
  name: string = "";
  race: string = "newter";
  skillObj: { [skill_name: string]: number } = {};
  partEquipObj: { [key: string]: any } = {};
  buffs: { [key: string]: any }[];
  updateDatetime: Date;

  constructor(
    id?: number,
    name?: string,
    race?: string,
    skill_json?: { [skill_name: string]: number },
    equip_json?: { [key: string]: any },
    addBuffs?: object[],
    updateDatetime?: Date
  ) {
    // super(props);
    this.id = id;
    this.name = name ? name : "";
    this.race = race ? race : "newter";
    this.skillObj = skill_json ? skill_json : {};
    this.partEquipObj = equip_json ? equip_json : {};
    this.buffs = addBuffs ? addBuffs : [];
    this.updateDatetime = updateDatetime;
  }

  getDateString() {
    if (this.updateDatetime) return this.updateDatetime.toLocaleString();
    else return "";
  }
}
