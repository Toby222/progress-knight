const UPDATE_SPEED = 30;
const BASE_LIFESPAN = 365 * 70;
const BASE_GAMESPEED = 4;
const UNITS = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

let gameData = {
  taskData: {},
  itemData: {},

  coins: 0,
  days: 365 * 14,
  evil: 0,
  paused: false,
  timeWarpingEnabled: true,

  rebirthOneCount: 0,
  rebirthTwoCount: 0,

  currentJob: null,
  currentSkill: null,
  currentProperty: null,
  currentMisc: null,
};

const tempData = {};

const autoPromoteElement = document.getElementById("autoPromote");
const autoLearnElement = document.getElementById("autoLearn");

const permanentUnlocks = ["Scheduling", "Shop", "Automation", "Quick task display"];

/** @type {{[jobName: string]: {name: string, maxXp: number, income: number}}} */
const jobBaseData = {
  Beggar: { name: "Beggar", maxXp: 50, income: 5 },
  Farmer: { name: "Farmer", maxXp: 100, income: 9 },
  Fisherman: { name: "Fisherman", maxXp: 200, income: 15 },
  Miner: { name: "Miner", maxXp: 400, income: 40 },
  Blacksmith: { name: "Blacksmith", maxXp: 800, income: 80 },
  Merchant: { name: "Merchant", maxXp: 1600, income: 150 },

  Squire: { name: "Squire", maxXp: 100, income: 5 },
  Footman: { name: "Footman", maxXp: 1000, income: 50 },
  "Veteran footman": { name: "Veteran footman", maxXp: 10000, income: 120 },
  Knight: { name: "Knight", maxXp: 100000, income: 300 },
  "Veteran knight": { name: "Veteran knight", maxXp: 1000000, income: 1000 },
  "Elite knight": { name: "Elite knight", maxXp: 7500000, income: 3000 },
  "Holy knight": { name: "Holy knight", maxXp: 40000000, income: 15000 },
  "Legendary knight": {
    name: "Legendary knight",
    maxXp: 150000000,
    income: 50000,
  },

  Student: { name: "Student", maxXp: 100000, income: 100 },
  "Apprentice mage": { name: "Apprentice mage", maxXp: 1000000, income: 1000 },
  Mage: { name: "Mage", maxXp: 10000000, income: 7500 },
  Wizard: { name: "Wizard", maxXp: 100000000, income: 50000 },
  "Master wizard": {
    name: "Master wizard",
    maxXp: 10000000000,
    income: 250000,
  },
  Chairman: { name: "Chairman", maxXp: 1000000000000, income: 1000000 },
};

/** @type {{[skillName: string]: {name: string, maxXp: number, effect: number, description: string}}} */
const skillBaseData = {
  Concentration: {
    name: "Concentration",
    maxXp: 100,
    effect: 0.01,
    description: "Skill xp",
  },
  Productivity: {
    name: "Productivity",
    maxXp: 100,
    effect: 0.01,
    description: "Job xp",
  },
  Bargaining: {
    name: "Bargaining",
    maxXp: 100,
    effect: -0.01,
    description: "Expenses",
  },
  Meditation: {
    name: "Meditation",
    maxXp: 100,
    effect: 0.01,
    description: "Happiness",
  },

  Strength: {
    name: "Strength",
    maxXp: 100,
    effect: 0.01,
    description: "Military pay",
  },
  "Battle tactics": {
    name: "Battle tactics",
    maxXp: 100,
    effect: 0.01,
    description: "Military xp",
  },
  "Muscle memory": {
    name: "Muscle memory",
    maxXp: 100,
    effect: 0.01,
    description: "Strength xp",
  },

  "Mana control": {
    name: "Mana control",
    maxXp: 100,
    effect: 0.01,
    description: "T.A.A. xp",
  },
  Immortality: {
    name: "Immortality",
    maxXp: 100,
    effect: 0.01,
    description: "Longer lifespan",
  },
  "Time warping": {
    name: "Time warping",
    maxXp: 100,
    effect: 0.01,
    description: "Gamespeed",
  },
  "Super immortality": {
    name: "Super immortality",
    maxXp: 100,
    effect: 0.01,
    description: "Longer lifespan",
  },

  "Dark influence": {
    name: "Dark influence",
    maxXp: 100,
    effect: 0.01,
    description: "All xp",
  },
  "Evil control": {
    name: "Evil control",
    maxXp: 100,
    effect: 0.01,
    description: "Evil gain",
  },
  Intimidation: {
    name: "Intimidation",
    maxXp: 100,
    effect: -0.01,
    description: "Expenses",
  },
  "Demon training": {
    name: "Demon training",
    maxXp: 100,
    effect: 0.01,
    description: "All xp",
  },
  "Blood meditation": {
    name: "Blood meditation",
    maxXp: 100,
    effect: 0.01,
    description: "Evil gain",
  },
  "Unholy recall": {
    name: "Unholy recall",
    maxXp: 100,
    effect: 0.0005,
    description: "Max levels kept",
  },
  "Demon's wealth": {
    name: "Demon's wealth",
    maxXp: 100,
    effect: 0.002,
    description: "Job pay",
  },
};

/** @type {{[itemName: string]: {name: string, expense: number, effect: number, description?: string}}} */
const itemBaseData = {
  Homeless: { name: "Homeless", expense: 0, effect: 1 },
  Tent: { name: "Tent", expense: 15, effect: 1.4 },
  "Wooden hut": { name: "Wooden hut", expense: 100, effect: 2 },
  Cottage: { name: "Cottage", expense: 750, effect: 3.5 },
  House: { name: "House", expense: 3000, effect: 6 },
  "Large house": { name: "Large house", expense: 25000, effect: 12 },
  "Small palace": { name: "Small palace", expense: 300000, effect: 25 },
  "Grand palace": { name: "Grand palace", expense: 5000000, effect: 60 },

  Book: { name: "Book", expense: 10, effect: 1.5, description: "Skill xp" },
  Dumbbells: {
    name: "Dumbbells",
    expense: 50,
    effect: 1.5,
    description: "Strength xp",
  },
  "Personal squire": {
    name: "Personal squire",
    expense: 200,
    effect: 2,
    description: "Job xp",
  },
  "Steel longsword": {
    name: "Steel longsword",
    expense: 1000,
    effect: 2,
    description: "Military xp",
  },
  Butler: {
    name: "Butler",
    expense: 7500,
    effect: 1.5,
    description: "Happiness",
  },
  "Sapphire charm": {
    name: "Sapphire charm",
    expense: 50000,
    effect: 3,
    description: "Magic xp",
  },
  "Study desk": {
    name: "Study desk",
    expense: 1000000,
    effect: 2,
    description: "Skill xp",
  },
  Library: {
    name: "Library",
    expense: 10000000,
    effect: 1.5,
    description: "Skill xp",
  },
};

const jobCategories = {
  "Common work": ["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"],
  Military: ["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight", "Elite knight", "Holy knight", "Legendary knight"],
  "The Arcane Association": ["Student", "Apprentice mage", "Mage", "Wizard", "Master wizard", "Chairman"],
};

const skillCategories = {
  Fundamentals: ["Concentration", "Productivity", "Bargaining", "Meditation"],
  Combat: ["Strength", "Battle tactics", "Muscle memory"],
  Magic: ["Mana control", "Immortality", "Time warping", "Super immortality"],
  "Dark magic": ["Dark influence", "Evil control", "Intimidation", "Demon training", "Blood meditation", "Unholy recall", "Demon's wealth"],
};

const itemCategories = {
  Properties: ["Homeless", "Tent", "Wooden hut", "Cottage", "House", "Large house", "Small palace", "Grand palace"],
  Misc: ["Book", "Dumbbells", "Personal squire", "Steel longsword", "Butler", "Sapphire charm", "Study desk", "Library"],
};

const headerRowColors = {
  "Common work": "#55a630",
  Military: "#e63946",
  "The Arcane Association": "#C71585",
  Fundamentals: "#4a4e69",
  Combat: "#ff704d",
  Magic: "#875F9A",
  "Dark magic": "#73000f",
  Properties: "#219ebc",
  Misc: "#b56576",
};

const tooltips = {
  Beggar: "Struggle day and night for a couple of copper coins. It feels like you are at the brink of death each day.",
  Farmer: "Plow the fields and grow the crops. It's not much but it's honest work.",
  Fisherman: "Reel in various fish and sell them for a handful of coins. A relaxing but still a poor paying job.",
  Miner: "Delve into dangerous caverns and mine valuable ores. The pay is quite meager compared to the risk involved.",
  Blacksmith: "Smelt ores and carefully forge weapons for the military. A respectable and OK paying commoner job.",
  Merchant: "Travel from town to town, bartering fine goods. The job pays decently well and is a lot less manually-intensive.",

  Squire: "Carry around your knight's shield and sword along the battlefield. Very meager pay but the work experience is quite valuable.",
  Footman: "Put down your life to battle with enemy soldiers. A courageous, respectable job but you are still worthless in the grand scheme of things.",
  "Veteran footman": "More experienced and useful than the average footman, take out the enemy forces in battle with your might. The pay is not that bad.",
  Knight: "Slash and pierce through enemy soldiers with ease, while covered in steel from head to toe. A decently paying and very respectable job.",
  "Veteran knight": "Utilising your unmatched combat ability, slaugher enemies effortlessly. Most footmen in the military would never be able to acquire such a well paying job like this.",
  "Elite knight": "Obliterate squadrons of enemy soldiers in one go with extraordinary proficiency, while equipped with the finest gear. Such a feared unit on the battlefield is paid extremely well.",
  "Holy knight": "Collapse entire armies in mere seconds with your magically imbued blade. The handful of elite knights who attain this level of power are showered with coins.",
  "Legendary knight": "Feared worldwide, obliterate entire nations in a blink of an eye. Roughly every century, only one holy knight is worthy of receiving such an esteemed title.",

  Student: "Study the theory of mana and practice basic spells. There is minor pay to cover living costs, however, this is a necessary stage in becoming a mage.",
  "Apprentice mage": "Under the supervision of a mage, perform basic spells against enemies in battle. Generous pay will be provided to cover living costs.",
  Mage: "Turn the tides of battle through casting intermediate spells and mentor other apprentices. The pay for this particular job is extremely high.",
  Wizard: "Utilise advanced spells to ravage and destroy entire legions of enemy soldiers. Only a small percentage of mages deserve to attain this role and are rewarded with an insanely high pay.",
  "Master wizard": "Blessed with unparalleled talent, perform unbelievable feats with magic at will. It is said that a master wizard has enough destructive power to wipe an empire off the map.",
  Chairman: "Spend your days administrating The Arcane Association and investigate the concepts of true immortality. The chairman receives ludicrous amounts of pay daily.",

  Concentration: "Improve your learning speed through practising intense concentration activities.",
  Productivity: "Learn to procrastinate less at work and receive more job experience per day.",
  Bargaining: "Study the tricks of the trade and persuasive skills to lower any type of expense.",
  Meditation: "Fill your mind with peace and tranquility to tap into greater happiness from within.",

  Strength: "Condition your body and strength through harsh training. Stronger individuals are paid more in the military.",
  "Battle tactics": "Create and revise battle strategies, improving experience gained in the military.",
  "Muscle memory": "Strengthen your neurons through habit and repetition, improving strength gains throughout the body.",

  "Mana control": "Strengthen your mana channels throughout your body, aiding you in becoming a more powerful magical user.",
  Immortality: "Lengthen your lifespan through the means of magic. However, is this truly the immortality you have tried seeking for...?",
  "Time warping": "Bend space and time through forbidden techniques, resulting in a faster gamespeed.",
  "Super immortality": "Through harnessing ancient, forbidden techniques, lengthen your lifespan drastically beyond comprehension.",

  "Dark influence": "Encompass yourself with formidable power bestowed upon you by evil, allowing you to pick up and absorb any job or skill with ease.",
  "Evil control": "Tame the raging and growing evil within you, improving evil gain in-between rebirths.",
  Intimidation: "Learn to emit a devilish aura which strikes extreme fear into other merchants, forcing them to give you heavy discounts.",
  "Demon training": "A mere human body is too feeble and weak to withstand evil. Train with forbidden methods to slowly manifest into a demon, capable of absorbing knowledge rapidly.",
  "Blood meditation": "Grow and culture the evil within you through the sacrifise of other living beings, drastically increasing evil gain.",
  "Unholy recall": "You've done all this before. Use the evil to remember your past lives and recover their power.",
  "Demon's wealth": "Through the means of dark magic, multiply the raw matter of the coins you receive from your job.",

  Homeless: "Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.",
  Tent: "A thin sheet of tattered cloth held up by a couple of feeble, wooden sticks. Horrible living conditions but at least you have a roof over your head.",
  "Wooden hut": "Shabby logs and dirty hay glued together with horse manure. Much more sturdy than a tent, however, the stench isn't very pleasant.",
  Cottage: "Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.",
  House: "A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.",
  "Large house": "Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.",
  "Small palace": "A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.",
  "Grand palace": "A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.",

  Book: "A place to write down all your thoughts and discoveries, allowing you to learn a lot more quickly.",
  Dumbbells: "Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before. ",
  "Personal squire": "Assists you in completing day to day activities, giving you more time to be productive at work.",
  "Steel longsword": "A fine blade used to slay enemies even quicker in combat and therefore gain more experience.",
  Butler: "Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.",
  "Sapphire charm": "Embedded with a rare sapphire, this charm activates more mana channels within your body, providing a much easier time learning magic.",
  "Study desk": "A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.",
  Library: "Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.",
};

const jobTabButton = document.getElementById("jobTabButton");

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function getBindedTaskEffect(taskName) {
  const task = gameData.taskData[taskName];
  return task.getEffect.bind(task);
}

function getBindedItemEffect(itemName) {
  const item = gameData.itemData[itemName];
  return item.getEffect.bind(item);
}

function addMultipliers() {
  for (const taskName in gameData.taskData) {
    const task = gameData.taskData[taskName];

    task.xpMultipliers = [task.getMaxLevelMultiplier.bind(task), getHappiness, getBindedTaskEffect("Dark influence"), getBindedTaskEffect("Demon training")];

    if (task instanceof Job) {
      task.incomeMultipliers = [];
      task.incomeMultipliers.push(task.getLevelMultiplier.bind(task));
      task.incomeMultipliers.push(getBindedTaskEffect("Demon's wealth"));
      task.xpMultipliers.push(getBindedTaskEffect("Productivity"));
      task.xpMultipliers.push(getBindedItemEffect("Personal squire"));
    } else if (task instanceof Skill) {
      task.xpMultipliers.push(getBindedTaskEffect("Concentration"));
      task.xpMultipliers.push(getBindedItemEffect("Book"));
      task.xpMultipliers.push(getBindedItemEffect("Study desk"));
      task.xpMultipliers.push(getBindedItemEffect("Library"));
    }

    if (jobCategories["Military"].includes(task.name)) {
      task.incomeMultipliers.push(getBindedTaskEffect("Strength"));
      task.xpMultipliers.push(getBindedTaskEffect("Battle tactics"));
      task.xpMultipliers.push(getBindedItemEffect("Steel longsword"));
    } else if (task.name === "Strength") {
      task.xpMultipliers.push(getBindedTaskEffect("Muscle memory"));
      task.xpMultipliers.push(getBindedItemEffect("Dumbbells"));
    } else if (skillCategories["Magic"].includes(task.name)) {
      task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"));
    } else if (jobCategories["The Arcane Association"].includes(task.name)) {
      task.xpMultipliers.push(getBindedTaskEffect("Mana control"));
    } else if (skillCategories["Dark magic"].includes(task.name)) {
      task.xpMultipliers.push(getEvil);
    }
  }

  for (const itemName in gameData.itemData) {
    const item = gameData.itemData[itemName];
    item.expenseMultipliers = [];
    item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"));
    item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"));
  }
}

function setCustomEffects() {
  const bargaining = gameData.taskData["Bargaining"];
  bargaining.getEffect = function () {
    let multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10;
    if (multiplier < 0.1) {
      multiplier = 0.1;
    }
    return multiplier;
  };

  const intimidation = gameData.taskData["Intimidation"];
  intimidation.getEffect = function () {
    let multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10;
    if (multiplier < 0.1) {
      multiplier = 0.1;
    }
    return multiplier;
  };

  const timeWarping = gameData.taskData["Time warping"];
  timeWarping.getEffect = function () {
    const multiplier = 1 + getBaseLog(13, timeWarping.level + 1);
    return multiplier;
  };

  const immortality = gameData.taskData["Immortality"];
  immortality.getEffect = function () {
    const multiplier = 1 + getBaseLog(33, immortality.level + 1);
    return multiplier;
  };

  //Define lower constraints for unholy recall
  const unholyRecall = gameData.taskData["Unholy recall"];
  unholyRecall.getEffect = function () {
    const multiplier = unholyRecall.level * 0.0005;
    return multiplier;
  };
}

function getHappiness() {
  const meditationEffect = getBindedTaskEffect("Meditation");
  const butlerEffect = getBindedItemEffect("Butler");
  const happiness = meditationEffect() * butlerEffect() * gameData.currentProperty.getEffect();
  return happiness;
}

function getEvil() {
  return gameData.evil;
}

/* eslint-disable-next-line no-unused-vars */
function applyMultipliers(value, multipliers) {
  let finalMultiplier = 1;
  multipliers.forEach(function (multiplierFunction) {
    const multiplier = multiplierFunction();
    finalMultiplier *= multiplier;
  });
  const finalValue = Math.round(value * finalMultiplier);
  return finalValue;
}

function applySpeed(value) {
  return (value * getGameSpeed()) / UPDATE_SPEED;
}

function getEvilGain() {
  const evilControl = gameData.taskData["Evil control"];
  const bloodMeditation = gameData.taskData["Blood meditation"];
  const evil = evilControl.getEffect() * bloodMeditation.getEffect();
  return evil;
}

function getGameSpeed() {
  const timeWarping = gameData.taskData["Time warping"];
  const timeWarpingSpeed = gameData.timeWarpingEnabled ? timeWarping.getEffect() : 1;
  const gameSpeed = BASE_GAMESPEED * +!gameData.paused * +isAlive() * timeWarpingSpeed;
  return gameSpeed;
}

function applyExpenses() {
  const coins = applySpeed(getExpense());
  gameData.coins -= coins;
  if (gameData.coins < 0) {
    goBankrupt();
  }
}

function getExpense() {
  let expense = 0;
  expense += gameData.currentProperty.getExpense();
  for (const misc of gameData.currentMisc) {
    expense += misc.getExpense();
  }
  return expense;
}

function goBankrupt() {
  gameData.coins = 0;
  gameData.currentProperty = gameData.itemData["Homeless"];
  gameData.currentMisc = [];
}

function setTab(element, selectedTab) {
  const tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"));
  tabs.forEach((tab) => {
    tab.style.display = "none";
  });
  document.getElementById(selectedTab).style.display = "block";

  const tabButtons = document.getElementsByClassName("tabButton");
  for (const tabButton of tabButtons) {
    tabButton.classList.remove("w3-blue-gray");
  }
  element.classList.add("w3-blue-gray");
}

/* eslint-disable-next-line no-unused-vars */
function setPause() {
  gameData.paused = !gameData.paused;
}

/* eslint-disable-next-line no-unused-vars */
function setTimeWarping() {
  gameData.timeWarpingEnabled = !gameData.timeWarpingEnabled;
}

function setTask(taskName) {
  const task = gameData.taskData[taskName];
  task instanceof Job ? (gameData.currentJob = task) : (gameData.currentSkill = task);
}

function setProperty(propertyName) {
  const property = gameData.itemData[propertyName];
  gameData.currentProperty = property;
}

function setMisc(miscName) {
  const misc = gameData.itemData[miscName];
  if (gameData.currentMisc.includes(misc)) {
    for (let i = 0; i < gameData.currentMisc.length; i++) {
      if (gameData.currentMisc[i] === misc) {
        gameData.currentMisc.splice(i, 1);
      }
    }
  } else {
    gameData.currentMisc.push(misc);
  }
}

function createData(data, baseData) {
  for (const key in baseData) {
    const entity = baseData[key];
    createEntity(data, entity);
  }
}

function createEntity(data, entity) {
  if ("income" in entity) {
    data[entity.name] = new Job(entity);
  } else if ("maxXp" in entity) {
    data[entity.name] = new Skill(entity);
  } else {
    data[entity.name] = new Item(entity);
  }
  data[entity.name].id = "row " + entity.name;
}

function createRequiredRow(categoryName) {
  const requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true);
  requiredRow.classList.add("requiredRow");
  requiredRow.classList.add(removeSpaces(categoryName));
  requiredRow.id = categoryName;
  return requiredRow;
}

function createHeaderRow(templates, categoryType, categoryName) {
  const headerRow = templates.headerRow.content.firstElementChild.cloneNode(true);
  headerRow.getElementsByClassName("category")[0].textContent = categoryName;
  if (categoryType !== itemCategories) {
    headerRow.getElementsByClassName("valueType")[0].textContent = categoryType === jobCategories ? "Income/day" : "Effect";
  }

  headerRow.style.backgroundColor = headerRowColors[categoryName];
  headerRow.style.color = "#ffffff";
  headerRow.classList.add(removeSpaces(categoryName));
  headerRow.classList.add("headerRow");

  return headerRow;
}

function createRow(templates, name, categoryName, categoryType) {
  const row = templates.row.content.firstElementChild.cloneNode(true);
  row.getElementsByClassName("name")[0].textContent = name;
  row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name];
  row.id = "row " + name;
  if (categoryType !== itemCategories) {
    row.getElementsByClassName("progressBar")[0].onclick = function () {
      setTask(name);
    };
  } else {
    row.getElementsByClassName("button")[0].onclick =
      categoryName === "Properties"
        ? function () {
            setProperty(name);
          }
        : function () {
            setMisc(name);
          };
  }

  return row;
}

function createAllRows(categoryType, tableId) {
  const templates = {
    headerRow: document.getElementsByClassName(categoryType === itemCategories ? "headerRowItemTemplate" : "headerRowTaskTemplate")[0],
    row: document.getElementsByClassName(categoryType === itemCategories ? "rowItemTemplate" : "rowTaskTemplate")[0],
  };

  const table = document.getElementById(tableId);

  for (const categoryName in categoryType) {
    const headerRow = createHeaderRow(templates, categoryType, categoryName);
    table.appendChild(headerRow);

    const category = categoryType[categoryName];
    category.forEach(function (name) {
      const row = createRow(templates, name, categoryName, categoryType);
      table.appendChild(row);
    });

    const requiredRow = createRequiredRow(categoryName);
    table.append(requiredRow);
  }
}

function updateQuickTaskDisplay(taskType) {
  const currentTask = taskType === "job" ? gameData.currentJob : gameData.currentSkill;
  const quickTaskDisplayElement = document.getElementById("quickTaskDisplay");
  const progressBar = quickTaskDisplayElement.getElementsByClassName(taskType)[0];
  progressBar.getElementsByClassName("name")[0].textContent = currentTask.name + " lvl " + currentTask.level;
  progressBar.getElementsByClassName("progressFill")[0].style.width = (currentTask.xp / currentTask.getMaxXp()) * 100 + "%";
}

function updateRequiredRows(data, categoryType) {
  const requiredRows = document.getElementsByClassName("requiredRow");
  for (const requiredRow of requiredRows) {
    let nextEntity = null;
    const category = categoryType[requiredRow.id];
    if (category === undefined) {
      continue;
    }
    for (let i = 0; i < category.length; i++) {
      const entityName = category[i];
      if (i >= category.length - 1) break;
      const requirements = gameData.requirements[entityName];
      if (requirements && i === 0) {
        if (!requirements.isCompleted()) {
          nextEntity = data[entityName];
          break;
        }
      }

      const nextIndex = i + 1;
      if (nextIndex >= category.length) {
        break;
      }
      const nextEntityName = category[nextIndex];
      const nextEntityRequirements = gameData.requirements[nextEntityName];

      if (!nextEntityRequirements.isCompleted()) {
        nextEntity = data[nextEntityName];
        break;
      }
    }

    if (nextEntity === null) {
      requiredRow.classList.add("hiddenTask");
    } else {
      requiredRow.classList.remove("hiddenTask");
      const requirementObject = gameData.requirements[nextEntity.name];
      const requirements = requirementObject.requirements;

      const coinElement = requiredRow.getElementsByClassName("coins")[0];
      const levelElement = requiredRow.getElementsByClassName("levels")[0];
      const evilElement = requiredRow.getElementsByClassName("evil")[0];

      coinElement.classList.add("hiddenTask");
      levelElement.classList.add("hiddenTask");
      evilElement.classList.add("hiddenTask");

      let finalText = "";
      if (data === gameData.taskData) {
        if (requirementObject instanceof EvilRequirement) {
          evilElement.classList.remove("hiddenTask");
          evilElement.textContent = format(requirements[0].requirement) + " evil";
        } else {
          levelElement.classList.remove("hiddenTask");
          for (const requirement of requirements) {
            const task = gameData.taskData[requirement.task];
            if (task.level >= requirement.requirement) continue;
            const text = " " + requirement.task + " level " + format(task.level) + "/" + format(requirement.requirement) + ",";
            finalText += text;
          }
          finalText = finalText.substring(0, finalText.length - 1);
          levelElement.textContent = finalText;
        }
      } else if (data === gameData.itemData) {
        coinElement.classList.remove("hiddenTask");
        formatCoins(requirements[0].requirement, coinElement);
      }
    }
  }
}

function updateTaskRows() {
  for (const key in gameData.taskData) {
    const task = gameData.taskData[key];
    const row = document.getElementById("row " + task.name);
    row.getElementsByClassName("level")[0].textContent = task.level;
    row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain());
    row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft());
    row.getElementsByClassName("daysLeft")[0].textContent = format(Math.ceil(parseFloat(task.getXpLeft() / task.getXpGain())));

    const maxLevel = row.getElementsByClassName("maxLevel")[0];
    maxLevel.textContent = task.maxLevel;
    gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden");

    const progressFill = row.getElementsByClassName("progressFill")[0];
    progressFill.style.width = (task.xp / task.getMaxXp()) * 100 + "%";
    task === gameData.currentJob || task === gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current");

    const valueElement = row.getElementsByClassName("value")[0];
    valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job;
    valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill;

    const skipSkillElement = row.getElementsByClassName("skipSkill")[0];
    skipSkillElement.style.display = task instanceof Skill && autoLearnElement.checked ? "block" : "none";

    if (task instanceof Job) {
      formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0]);
    } else {
      valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription();
    }
  }
}

function updateItemRows() {
  for (const key in gameData.itemData) {
    const item = gameData.itemData[key];
    const row = document.getElementById("row " + item.name);
    const button = row.getElementsByClassName("button")[0];
    button.disabled = gameData.coins < item.getExpense();
    const active = row.getElementsByClassName("active")[0];
    const color = itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"];
    active.style.backgroundColor = gameData.currentMisc.includes(item) || item === gameData.currentProperty ? color : "white";
    row.getElementsByClassName("effect")[0].textContent = item.getEffectDescription();
    formatCoins(item.getExpense(), row.getElementsByClassName("expense")[0]);
  }
}

function updateHeaderRows(categories) {
  for (const categoryName in categories) {
    const className = removeSpaces(categoryName);
    const headerRow = document.getElementsByClassName(className)[0];
    const maxLevelElement = headerRow.getElementsByClassName("maxLevel")[0];
    gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden");
    const skipSkillElement = headerRow.getElementsByClassName("skipSkill")[0];
    skipSkillElement.style.display = categories === skillCategories && autoLearnElement.checked ? "block" : "none";
  }
}

function updateText() {
  //Sidebar
  document.getElementById("ageDisplay").textContent = daysToYears(gameData.days);
  document.getElementById("dayDisplay").textContent = getDay();
  document.getElementById("lifespanDisplay").textContent = daysToYears(getLifespan());
  document.getElementById("pauseButton").textContent = gameData.paused ? "Play" : "Pause";

  formatCoins(gameData.coins, document.getElementById("coinDisplay"));
  setSignDisplay();
  formatCoins(getNet(), document.getElementById("netDisplay"));
  formatCoins(getIncome(), document.getElementById("incomeDisplay"));
  formatCoins(getExpense(), document.getElementById("expenseDisplay"));

  document.getElementById("happinessDisplay").textContent = getHappiness().toFixed(1);

  document.getElementById("evilDisplay").textContent = gameData.evil.toFixed(1);
  document.getElementById("evilGainDisplay").textContent = getEvilGain().toFixed(1);

  document.getElementById("timeWarpingDisplay").textContent = "x" + gameData.taskData["Time warping"].getEffect().toFixed(2);
  document.getElementById("timeWarpingButton").textContent = gameData.timeWarpingEnabled ? "Disable warp" : "Enable warp";
}

function setSignDisplay() {
  const signDisplay = document.getElementById("signDisplay");
  if (getIncome() > getExpense()) {
    signDisplay.textContent = "+";
    signDisplay.style.color = "green";
  } else if (getExpense() > getIncome()) {
    signDisplay.textContent = "-";
    signDisplay.style.color = "red";
  } else {
    signDisplay.textContent = "";
    signDisplay.style.color = "gray";
  }
}

function getNet() {
  const net = Math.abs(getIncome() - getExpense());
  return net;
}

function hideEntities() {
  for (const key in gameData.requirements) {
    const requirement = gameData.requirements[key];
    const completed = requirement.isCompleted();
    for (const element of requirement.elements) {
      if (completed) {
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
      }
    }
  }
}

/*
function createItemData(baseData) {
  for (const item of baseData) {
    gameData.itemData[item.name] =
      "happiness" in item ? new Property(task) : new Misc(task);
    gameData.itemData[item.name].id = "item " + item.name;
  }
}
*/

function doCurrentTask(task) {
  task.increaseXp();
  if (task instanceof Job) {
    increaseCoins();
  }
}

function getIncome() {
  let income = 0;
  income += gameData.currentJob.getIncome();
  return income;
}

function increaseCoins() {
  const coins = applySpeed(getIncome());
  gameData.coins += coins;
}

function daysToYears(days) {
  const years = Math.floor(days / 365);
  return years;
}

function getCategoryFromEntityName(categoryType, entityName) {
  for (const categoryName in categoryType) {
    const category = categoryType[categoryName];
    if (category.includes(entityName)) {
      return category;
    }
  }
}

function getNextEntity(data, categoryType, entityName) {
  const category = getCategoryFromEntityName(categoryType, entityName);
  const nextIndex = category.indexOf(entityName) + 1;
  if (nextIndex > category.length - 1) return null;
  const nextEntityName = category[nextIndex];
  const nextEntity = data[nextEntityName];
  return nextEntity;
}

function autoPromote() {
  if (!autoPromoteElement.checked) return;
  const nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name);
  if (nextEntity === null) return;
  const requirement = gameData.requirements[nextEntity.name];
  if (requirement.isCompleted()) gameData.currentJob = nextEntity;
}

function checkSkillSkipped(skill) {
  return document.getElementById("row " + skill.name).getElementsByClassName("checkbox")[0].checked;
}

function getSkillWithLowestDaysLeft() {
  return Object.entries(gameData.taskData)
    .filter(([taskName, task]) => task instanceof Skill && gameData.requirements[taskName].isCompleted() && !checkSkillSkipped(task))
    .map(([_taskName, task]) => task)
    .sort((a, b) => a.getXpLeft() / a.getXpGain() - b.getXpLeft() / b.getXpGain())[0];
}

function autoLearn() {
  if (!autoLearnElement.checked) return;
  gameData.currentSkill = getSkillWithLowestDaysLeft() || gameData.currentSkill;
}

function getDay() {
  const day = Math.floor(gameData.days - daysToYears(gameData.days) * 365);
  return day;
}

function increaseDays() {
  const increase = applySpeed(1);
  gameData.days += increase;
}

function format(number) {
  // what tier? (determines SI symbol)
  const tier = (Math.log10(number) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier === 0) return number;

  // get suffix and determine scale
  const suffix = UNITS[tier];
  const scale = Math.pow(10, tier * 3);

  // scale the number
  const scaled = number / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}

function formatCoins(coins, element) {
  const tiers = ["p", "g", "s"];
  const colors = {
    p: "#79b9c7",
    g: "#E5C100",
    s: "#a8a8a8",
    c: "#a15c2f",
  };
  let leftOver = coins;
  let i = 0;
  for (const tier of tiers) {
    const x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2));
    leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2));
    const text = format(String(x)) + tier + " ";
    element.children[i].textContent = x > 0 ? text : "";
    element.children[i].style.color = colors[tier];
    i += 1;
  }
  if (leftOver === 0 && coins > 0) {
    element.children[3].textContent = "";
    return;
  }
  const text = String(Math.floor(leftOver)) + "c";
  element.children[3].textContent = text;
  element.children[3].style.color = colors["c"];
}

function getTaskElement(taskName) {
  const task = gameData.taskData[taskName];
  const element = document.getElementById(task.id);
  return element;
}

function getItemElement(itemName) {
  const item = gameData.itemData[itemName];
  const element = document.getElementById(item.id);
  return element;
}

function getElementsByClass(className) {
  const elements = document.getElementsByClassName(removeSpaces(className));
  return elements;
}

/* eslint-disable-next-line no-unused-vars */
function setLightDarkMode() {
  const body = document.getElementById("body");
  body.classList.contains("dark") ? body.classList.remove("dark") : body.classList.add("dark");
}

function removeSpaces(string) {
  return string.replace(/ /g, "");
}

/* eslint-disable-next-line no-unused-vars */
function rebirthOne() {
  gameData.rebirthOneCount += 1;

  rebirthReset();
}

/* eslint-disable-next-line no-unused-vars */
function rebirthTwo() {
  gameData.rebirthTwoCount += 1;
  gameData.evil += getEvilGain();

  const recallEffect = gameData.taskData["Unholy recall"].getEffect();
  rebirthReset();

  for (const taskName in gameData.taskData) {
    const task = gameData.taskData[taskName];
    task.maxLevel = Math.floor(recallEffect * task.maxLevel);
  }
}

function rebirthReset() {
  setTab(jobTabButton, "jobs");

  gameData.coins = 0;
  gameData.days = 365 * 14;
  gameData.currentJob = gameData.taskData["Beggar"];
  gameData.currentSkill = gameData.taskData["Concentration"];
  gameData.currentProperty = gameData.itemData["Homeless"];
  gameData.currentMisc = [];

  for (const taskName in gameData.taskData) {
    const task = gameData.taskData[taskName];
    if (task.level > task.maxLevel) task.maxLevel = task.level;
    task.level = 0;
    task.xp = 0;
  }

  for (const key in gameData.requirements) {
    const requirement = gameData.requirements[key];
    if (requirement.completed && permanentUnlocks.includes(key)) continue;
    requirement.completed = false;
  }
}

function getLifespan() {
  const immortality = gameData.taskData["Immortality"];
  const superImmortality = gameData.taskData["Super immortality"];
  const lifespan = BASE_LIFESPAN * immortality.getEffect() * superImmortality.getEffect();
  return lifespan;
}

function isAlive() {
  const condition = gameData.days < getLifespan();
  const deathText = document.getElementById("deathText");
  if (!condition) {
    gameData.days = getLifespan();
    deathText.classList.remove("hidden");
  } else {
    deathText.classList.add("hidden");
  }
  return condition;
}

function assignMethods() {
  for (const key in gameData.taskData) {
    let task = gameData.taskData[key];
    if (task.baseData.income) {
      task.baseData = jobBaseData[task.name];
      task = Object.assign(new Job(jobBaseData[task.name]), task);
    } else {
      task.baseData = skillBaseData[task.name];
      task = Object.assign(new Skill(skillBaseData[task.name]), task);
    }
    gameData.taskData[key] = task;
  }

  for (const key in gameData.itemData) {
    let item = gameData.itemData[key];
    item.baseData = itemBaseData[item.name];
    item = Object.assign(new Item(itemBaseData[item.name]), item);
    gameData.itemData[key] = item;
  }

  for (const key in gameData.requirements) {
    let requirement = gameData.requirements[key];
    if (requirement.type === "task") {
      requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement);
    } else if (requirement.type === "coins") {
      requirement = Object.assign(new CoinRequirement(requirement.elements, requirement.requirements), requirement);
    } else if (requirement.type === "age") {
      requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement);
    } else if (requirement.type === "evil") {
      requirement = Object.assign(new EvilRequirement(requirement.elements, requirement.requirements), requirement);
    }

    const tempRequirement = tempData["requirements"][key];
    requirement.elements = tempRequirement.elements;
    requirement.requirements = tempRequirement.requirements;
    gameData.requirements[key] = requirement;
  }

  gameData.currentJob = gameData.taskData[gameData.currentJob.name];
  gameData.currentSkill = gameData.taskData[gameData.currentSkill.name];
  gameData.currentProperty = gameData.itemData[gameData.currentProperty.name];
  const newArray = [];
  for (const misc of gameData.currentMisc) {
    newArray.push(gameData.itemData[misc.name]);
  }
  gameData.currentMisc = newArray;
}

function replaceSaveDict(dict, saveDict) {
  for (const key in dict) {
    if (!(key in saveDict)) {
      saveDict[key] = dict[key];
    } else if (dict === gameData.requirements) {
      if (saveDict[key].type !== tempData["requirements"][key].type) {
        saveDict[key] = tempData["requirements"][key];
      }
    }
  }

  for (const key in saveDict) {
    if (!(key in dict)) {
      delete saveDict[key];
    }
  }
}

function saveGameData() {
  localStorage.setItem("gameDataSave", JSON.stringify(gameData));
}

function loadGameData() {
  const gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"));

  if (gameDataSave !== null) {
    replaceSaveDict(gameData, gameDataSave);
    replaceSaveDict(gameData.requirements, gameDataSave.requirements);
    replaceSaveDict(gameData.taskData, gameDataSave.taskData);
    replaceSaveDict(gameData.itemData, gameDataSave.itemData);

    gameData = gameDataSave;
  }

  assignMethods();
}

function updateUI() {
  updateTaskRows();
  updateItemRows();
  updateRequiredRows(gameData.taskData, jobCategories);
  updateRequiredRows(gameData.taskData, skillCategories);
  updateRequiredRows(gameData.itemData, itemCategories);
  updateHeaderRows(jobCategories);
  updateHeaderRows(skillCategories);
  updateQuickTaskDisplay("job");
  updateQuickTaskDisplay("skill");
  hideEntities();
  updateText();
}

function update() {
  increaseDays();
  autoPromote();
  autoLearn();
  doCurrentTask(gameData.currentJob);
  doCurrentTask(gameData.currentSkill);
  applyExpenses();
  updateUI();
}

/* eslint-disable-next-line no-unused-vars */
function resetGameData() {
  localStorage.clear();
  location.reload();
}

/* eslint-disable-next-line no-unused-vars */
function importGameData() {
  const importExportBox = document.getElementById("importExportBox");
  const data = JSON.parse(window.atob(importExportBox.value));
  gameData = data;
  saveGameData();
  location.reload();
}

/* eslint-disable-next-line no-unused-vars */
function exportGameData() {
  const importExportBox = document.getElementById("importExportBox");
  importExportBox.value = window.btoa(JSON.stringify(gameData));
}

//Init

createAllRows(jobCategories, "jobTable");
createAllRows(skillCategories, "skillTable");
createAllRows(itemCategories, "itemTable");

createData(gameData.taskData, jobBaseData);
createData(gameData.taskData, skillBaseData);
createData(gameData.itemData, itemBaseData);

gameData.currentJob = gameData.taskData["Beggar"];
gameData.currentSkill = gameData.taskData["Concentration"];
gameData.currentProperty = gameData.itemData["Homeless"];
gameData.currentMisc = [];

gameData.requirements = {
  //Other
  "The Arcane Association": new TaskRequirement(getElementsByClass("The Arcane Association"), [
    { task: "Concentration", requirement: 200 },
    { task: "Meditation", requirement: 200 },
  ]),
  "Dark magic": new EvilRequirement(getElementsByClass("Dark magic"), [{ requirement: 1 }]),
  Shop: new CoinRequirement([document.getElementById("shopTabButton")], [{ requirement: gameData.itemData["Tent"].getExpense() * 50 }]),
  "Rebirth tab": new AgeRequirement([document.getElementById("rebirthTabButton")], [{ requirement: 25 }]),
  "Rebirth note 1": new AgeRequirement([document.getElementById("rebirthNote1")], [{ requirement: 45 }]),
  "Rebirth note 2": new AgeRequirement([document.getElementById("rebirthNote2")], [{ requirement: 65 }]),
  "Rebirth note 3": new AgeRequirement([document.getElementById("rebirthNote3")], [{ requirement: 200 }]),
  "Evil info": new EvilRequirement([document.getElementById("evilInfo")], [{ requirement: 1 }]),
  "Time warping info": new TaskRequirement([document.getElementById("timeWarping")], [{ task: "Mage", requirement: 10 }]),
  Automation: new AgeRequirement([document.getElementById("automation")], [{ requirement: 15 }]),
  "Quick task display": new AgeRequirement([document.getElementById("quickTaskDisplay")], [{ requirement: 20 }]),

  //Common work
  Beggar: new TaskRequirement([getTaskElement("Beggar")], []),
  Farmer: new TaskRequirement([getTaskElement("Farmer")], [{ task: "Beggar", requirement: 10 }]),
  Fisherman: new TaskRequirement([getTaskElement("Fisherman")], [{ task: "Farmer", requirement: 10 }]),
  Miner: new TaskRequirement(
    [getTaskElement("Miner")],
    [
      { task: "Strength", requirement: 10 },
      { task: "Fisherman", requirement: 10 },
    ]
  ),
  Blacksmith: new TaskRequirement(
    [getTaskElement("Blacksmith")],
    [
      { task: "Strength", requirement: 30 },
      { task: "Miner", requirement: 10 },
    ]
  ),
  Merchant: new TaskRequirement(
    [getTaskElement("Merchant")],
    [
      { task: "Bargaining", requirement: 50 },
      { task: "Blacksmith", requirement: 10 },
    ]
  ),

  //Military
  Squire: new TaskRequirement([getTaskElement("Squire")], [{ task: "Strength", requirement: 5 }]),
  Footman: new TaskRequirement(
    [getTaskElement("Footman")],
    [
      { task: "Strength", requirement: 20 },
      { task: "Squire", requirement: 10 },
    ]
  ),
  "Veteran footman": new TaskRequirement(
    [getTaskElement("Veteran footman")],
    [
      { task: "Battle tactics", requirement: 40 },
      { task: "Footman", requirement: 10 },
    ]
  ),
  Knight: new TaskRequirement(
    [getTaskElement("Knight")],
    [
      { task: "Strength", requirement: 100 },
      { task: "Veteran footman", requirement: 10 },
    ]
  ),
  "Veteran knight": new TaskRequirement(
    [getTaskElement("Veteran knight")],
    [
      { task: "Battle tactics", requirement: 150 },
      { task: "Knight", requirement: 10 },
    ]
  ),
  "Elite knight": new TaskRequirement(
    [getTaskElement("Elite knight")],
    [
      { task: "Strength", requirement: 300 },
      { task: "Veteran knight", requirement: 10 },
    ]
  ),
  "Holy knight": new TaskRequirement(
    [getTaskElement("Holy knight")],
    [
      { task: "Mana control", requirement: 500 },
      { task: "Elite knight", requirement: 10 },
    ]
  ),
  "Legendary knight": new TaskRequirement(
    [getTaskElement("Legendary knight")],
    [
      { task: "Mana control", requirement: 1000 },
      { task: "Battle tactics", requirement: 1000 },
      { task: "Holy knight", requirement: 10 },
    ]
  ),

  //The Arcane Association
  Student: new TaskRequirement(
    [getTaskElement("Student")],
    [
      { task: "Concentration", requirement: 200 },
      { task: "Meditation", requirement: 200 },
    ]
  ),
  "Apprentice mage": new TaskRequirement(
    [getTaskElement("Apprentice mage")],
    [
      { task: "Mana control", requirement: 400 },
      { task: "Student", requirement: 10 },
    ]
  ),
  Mage: new TaskRequirement(
    [getTaskElement("Mage")],
    [
      { task: "Mana control", requirement: 700 },
      { task: "Apprentice mage", requirement: 10 },
    ]
  ),
  Wizard: new TaskRequirement(
    [getTaskElement("Wizard")],
    [
      { task: "Mana control", requirement: 1000 },
      { task: "Mage", requirement: 10 },
    ]
  ),
  "Master wizard": new TaskRequirement(
    [getTaskElement("Master wizard")],
    [
      { task: "Mana control", requirement: 1500 },
      { task: "Wizard", requirement: 10 },
    ]
  ),
  Chairman: new TaskRequirement(
    [getTaskElement("Chairman")],
    [
      { task: "Mana control", requirement: 2000 },
      { task: "Master wizard", requirement: 10 },
    ]
  ),

  //Fundamentals
  Concentration: new TaskRequirement([getTaskElement("Concentration")], []),
  Productivity: new TaskRequirement([getTaskElement("Productivity")], [{ task: "Concentration", requirement: 5 }]),
  Bargaining: new TaskRequirement([getTaskElement("Bargaining")], [{ task: "Concentration", requirement: 20 }]),
  Meditation: new TaskRequirement(
    [getTaskElement("Meditation")],
    [
      { task: "Concentration", requirement: 30 },
      { task: "Productivity", requirement: 20 },
    ]
  ),

  //Combat
  Strength: new TaskRequirement([getTaskElement("Strength")], []),
  "Battle tactics": new TaskRequirement([getTaskElement("Battle tactics")], [{ task: "Concentration", requirement: 20 }]),
  "Muscle memory": new TaskRequirement(
    [getTaskElement("Muscle memory")],
    [
      { task: "Concentration", requirement: 30 },
      { task: "Strength", requirement: 30 },
    ]
  ),

  //Magic
  "Mana control": new TaskRequirement(
    [getTaskElement("Mana control")],
    [
      { task: "Concentration", requirement: 200 },
      { task: "Meditation", requirement: 200 },
    ]
  ),
  Immortality: new TaskRequirement([getTaskElement("Immortality")], [{ task: "Apprentice mage", requirement: 10 }]),
  "Time warping": new TaskRequirement([getTaskElement("Time warping")], [{ task: "Mage", requirement: 10 }]),
  "Super immortality": new TaskRequirement([getTaskElement("Super immortality")], [{ task: "Chairman", requirement: 1000 }]),

  //Dark magic
  "Dark influence": new EvilRequirement([getTaskElement("Dark influence")], [{ requirement: 1 }]),
  "Evil control": new EvilRequirement([getTaskElement("Evil control")], [{ requirement: 1 }]),
  Intimidation: new EvilRequirement([getTaskElement("Intimidation")], [{ requirement: 1 }]),
  "Demon training": new EvilRequirement([getTaskElement("Demon training")], [{ requirement: 25 }]),
  "Blood meditation": new EvilRequirement([getTaskElement("Blood meditation")], [{ requirement: 75 }]),
  "Unholy recall": new EvilRequirement([getTaskElement("Unholy recall")], [{ requirement: 75 }]),
  "Demon's wealth": new EvilRequirement([getTaskElement("Demon's wealth")], [{ requirement: 500 }]),

  //Properties
  Homeless: new CoinRequirement([getItemElement("Homeless")], [{ requirement: 0 }]),
  Tent: new CoinRequirement([getItemElement("Tent")], [{ requirement: 0 }]),
  "Wooden hut": new CoinRequirement([getItemElement("Wooden hut")], [{ requirement: gameData.itemData["Wooden hut"].getExpense() * 100 }]),
  Cottage: new CoinRequirement([getItemElement("Cottage")], [{ requirement: gameData.itemData["Cottage"].getExpense() * 100 }]),
  House: new CoinRequirement([getItemElement("House")], [{ requirement: gameData.itemData["House"].getExpense() * 100 }]),
  "Large house": new CoinRequirement([getItemElement("Large house")], [{ requirement: gameData.itemData["Large house"].getExpense() * 100 }]),
  "Small palace": new CoinRequirement([getItemElement("Small palace")], [{ requirement: gameData.itemData["Small palace"].getExpense() * 100 }]),
  "Grand palace": new CoinRequirement([getItemElement("Grand palace")], [{ requirement: gameData.itemData["Grand palace"].getExpense() * 100 }]),

  //Misc
  Book: new CoinRequirement([getItemElement("Book")], [{ requirement: 0 }]),
  Dumbbells: new CoinRequirement([getItemElement("Dumbbells")], [{ requirement: gameData.itemData["Dumbbells"].getExpense() * 100 }]),
  "Personal squire": new CoinRequirement([getItemElement("Personal squire")], [{ requirement: gameData.itemData["Personal squire"].getExpense() * 100 }]),
  "Steel longsword": new CoinRequirement([getItemElement("Steel longsword")], [{ requirement: gameData.itemData["Steel longsword"].getExpense() * 100 }]),
  Butler: new CoinRequirement([getItemElement("Butler")], [{ requirement: gameData.itemData["Butler"].getExpense() * 100 }]),
  "Sapphire charm": new CoinRequirement([getItemElement("Sapphire charm")], [{ requirement: gameData.itemData["Sapphire charm"].getExpense() * 100 }]),
  "Study desk": new CoinRequirement([getItemElement("Study desk")], [{ requirement: gameData.itemData["Study desk"].getExpense() * 100 }]),
  Library: new CoinRequirement([getItemElement("Library")], [{ requirement: gameData.itemData["Library"].getExpense() * 100 }]),
};

tempData["requirements"] = {};
for (const [key, requirement] of Object.entries(gameData.requirements)) {
  tempData["requirements"][key] = requirement;
}

loadGameData();

setCustomEffects();
addMultipliers();

setTab(jobTabButton, "jobs");

update();
setInterval(update, 1000 / UPDATE_SPEED);
setInterval(saveGameData, 3000);
