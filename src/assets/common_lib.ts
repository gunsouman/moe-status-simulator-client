import Buff from "../class/buff";
import configs from "./configs";

function compareBuffs(oldArray: Buff[], newArray: Buff[]) {
  // 削除されたオブジェクトを取得
  const deletedObjects = oldArray.filter((oldObj) => {
    return !newArray.find((newObj) => newObj.name === oldObj.name);
  });

  // 増加したオブジェクトを取得
  const addedObjects = newArray.filter((newObj) => {
    return !oldArray.find((oldObj) => oldObj.name === newObj.name);
  });

  return { add: addedObjects, delete: deletedObjects };
}

function generateUniqueIndex() {
  const now = new Date();
  const timestamp = now.getTime().toString(); // 現在時刻のタイムスタンプを取得
  const randomString = Math.random().toString(36).substring(2, 8); // 6桁のランダムな文字列を生成
  const _otherIndex = timestamp + randomString;
  return _otherIndex;
}
function hasClassInChildren(element: Element, className: string) {
  // console.log("hasClassInChildren", className, element.classList, element )
  if (element.classList.contains(className)) {
    return true;
  }

  for (let i = 0; i < element.children.length; i++) {
    if (hasClassInChildren(element.children[i], className)) {
      return true;
    }
  }

  return false;
}

function NumberToStr(number: number | string) {
  if (typeof number == "number") {
    const sign = Math.sign(number);
    const signString = sign === -1 ? "-" : "+";
    const absoluteString = Math.abs(number).toString();
    const result = signString + absoluteString;
    return result;
  } else {
    return "+" + number;
  }
}

function abbreviateSkillName(_skill_name: string) {
  if (configs.ABBREVIATE_SKILL_NAME[_skill_name] != null) {
    return configs.ABBREVIATE_SKILL_NAME[_skill_name];
  } else {
    return _skill_name;
  }
}

function buildMatch(cond: any) {
  const newCond: any = {};
  for (const key in cond) {
    let newKey = "";
    const keySplits = key.split(".");
    for (const keySplit of keySplits) {
      newKey += (newKey === "" ? "" : ".") + keySplit;
    }

    if (typeof cond[key] === "object") {
      newCond[newKey] = buildMatch(cond[key]);
    } else if (Array.isArray(cond[key])) {
      const condOrList = [];
      for (const condListData of cond[key]) {
        condOrList.push({ [key]: condListData });
      }
      newCond["$or"] = condOrList;
    } else {
      newCond[newKey] = cond[key];
    }
  }
  return newCond;
}

function buildFilter(cond: any) {
  const newCond: any = {};
  for (const key in cond) {
    let newKey = "";
    const keySplits = key.split(".");
    for (const keySplit of keySplits) {
      newKey += (newKey === "" ? "" : ".") + keySplit;
    }

    if (typeof cond[key] === "object") {
      newCond[newKey] = buildFilter(cond[key]);
    } else if (Array.isArray(cond[key])) {
      const condOrList = [];
      for (const condListData of cond[key]) {
        condOrList.push({ [key]: condListData });
      }
      newCond["$or"] = condOrList;
    } else {
      newCond[newKey] = { $regex: cond[key] };
    }
  }
  return newCond;
}

function buildRange(cond: any) {
  const newCond: any = {};

  for (const key in cond) {
    let newKey = "";
    const keySplits = key.split(".");
    for (const keySplit of keySplits) {
      newKey += (newKey === "" ? "" : ".") + keySplit;
    }

    if (!Array.isArray(cond[key]) && typeof cond[key] === "object") {
      newCond[newKey] = buildRange(cond[key]);
    } else if (Array.isArray(cond[key])) {
      if (cond[key].length === 0) {
        break;
      }
      if (cond[key].length < 2) {
        cond[key] = cond[key].concat([null].slice(2 - cond[key].length));
      }
      newCond[newKey] = {};
      if (cond[key][0]) {
        newCond[newKey]["$gte"] = cond[key][0];
      }
      if (cond[key][1]) {
        newCond[newKey]["$lte"] = cond[key][1];
      }
    } else {
      break;
    }
  }
  return newCond;
}

export { compareBuffs, generateUniqueIndex, hasClassInChildren, NumberToStr, abbreviateSkillName, buildMatch, buildFilter, buildRange };
