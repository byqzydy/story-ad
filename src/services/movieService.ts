/**
 * Movie Service for fetching movie information
 */

export interface MovieInfo {
  name: string
  synopsis: string
  characters: string[]
  scenes: string[]
  director: string
  year: string
  genre: string
}

const MOVIE_DATABASE: Record<string, MovieInfo> = {
  '速度与激情': {
    name: '速度与激情',
    synopsis: '《速度与激情》是罗伯·科恩执导的动作片。故事围绕洛杉矶街头赛车手多米尼克展开，他与朋友们组成了一支默契的赛车团队。布莱恩是卧底警察，奉命渗透到街头赛车圈子调查卡车劫案，与多米尼克建立了深厚友谊。',
    characters: [
      '多米尼克·托雷托 - 团队领袖，重情重义',
      '布莱恩·奥康纳 - 卧底警察，赛车天才',
      '米娅·托雷托 - 多米尼克的妹妹，冷静理性'
    ],
    scenes: [
      '街头赛车开场 - 引擎轰鸣，霓虹灯下的速度对决',
      '卡车追逐 - 生死时速中的惊险追逐',
      '家庭聚餐 - 院子里其乐融融的烤肉聚会'
    ],
    director: '罗伯·科恩',
    year: '2001',
    genre: '动作/犯罪'
  },
  '黑客帝国': {
    name: '黑客帝国',
    synopsis: '《黑客帝国》是沃卓斯基兄弟执导的科幻经典。故事发生在2199年，人类被机器统治，所谓的现实世界是由"矩阵"超级计算机模拟的虚拟世界。主角尼奥是程序员兼黑客，被反抗军找到后觉醒了"天选之子"的能力。',
    characters: [
      '尼奥 - 程序员觉醒的救世主',
      '墨菲斯 - 反抗军领袖',
      '崔妮蒂 - 黑客女神'
    ],
    scenes: [
      '红蓝药丸的选择',
      '子弹时间',
      '火车站的觉醒'
    ],
    director: '沃卓斯基兄弟',
    year: '1999',
    genre: '科幻/动作'
  },
  '泰坦尼克号': {
    name: '泰坦尼克号',
    synopsis: '《泰坦尼克号》是詹姆斯·卡梅隆执导的爱情灾难片。贵族小姐罗丝在跨大西洋航行中试图跳船自尽，被青年画家杰克救下。两人迅速坠入爱河，但泰坦尼克号撞上冰山，杰克把生存机会让给了罗丝。',
    characters: [
      '罗丝 - 贵族小姐，追求自由',
      '杰克 - 自由画家，浪漫主义者'
    ],
    scenes: [
      '船头飞翔 - 经典浪漫镜头',
      '杰克为罗丝画像',
      '三等舱派对'
    ],
    director: '詹姆斯·卡梅隆',
    year: '1997',
    genre: '爱情/灾难'
  },
  '星球大战': {
    name: '星球大战',
    synopsis: '《星球大战》是乔治·卢卡斯创作的科幻史诗。故事发生在遥远的银河系，讲述了反抗军与银河帝国之间的战争。卢克·天行者从一个农场少年成长为绝地武士，与父亲达斯·维达展开对决。',
    characters: [
      '卢克·天行者 - 成长的绝地武士',
      '莱娅公主 - 反抗军领袖',
      '达斯·维达 - 堕落的绝地武士'
    ],
    scenes: [
      '酒吧场景 - 各种外星人聚集',
      '光剑对决',
      '千年隼号追逐'
    ],
    director: '乔治·卢卡斯',
    year: '1977',
    genre: '科幻/冒险'
  },
  '哈利波特': {
    name: '哈利波特',
    synopsis: '《哈利波特》是克里斯·哥伦布执导的奇幻电影。讲述哈利波特在11岁时发现自己是一名巫师，进入霍格沃茨魔法学校学习魔法的故事。他与罗恩、赫敏成为好友，共同对抗伏地魔。',
    characters: [
      '哈利波特 - 救世之星',
      '罗恩·韦斯莱 - 哈利的好友',
      '赫敏·格兰杰 - 聪明的女巫'
    ],
    scenes: [
      '霍格沃茨大厅 - 开学典礼',
      '魁地奇比赛',
      '禁林探险'
    ],
    director: '克里斯·哥伦布',
    year: '2001',
    genre: '奇幻/冒险'
  },
  '肖申克的救赎': {
    name: '肖申克的救赎',
    synopsis: '《肖申克的救赎》是弗兰克·达拉邦特执导的经典监狱片。银行家安迪被冤枉入狱，在肖申克监狱度过了19年。他用智慧和坚韧不仅救赎了自己，也救赎了狱友瑞德。',
    characters: [
      '安迪·杜佛兰 - 智慧的银行家',
      '瑞德 - 监狱里的老手'
    ],
    scenes: [
      '越狱 - 经典的挖隧道场景',
      '屋顶修缮 - 为狱友争取啤酒',
      '图书馆建立'
    ],
    director: '弗兰克·达拉邦特',
    year: '1994',
    genre: '剧情'
  },
  '周星驰系列': {
    name: '周星驰系列',
    synopsis: '周星驰是香港喜剧电影的代表人物，他的电影以无厘头喜剧风格著称。代表作品包括《功夫》、《大话西游》、《少林足球》等，以其独特的幽默感和深刻的情感表达著称。',
    characters: [
      '至尊宝/周星驰 - 搞笑英雄',
      '紫霞仙子 - 至尊宝的爱人'
    ],
    scenes: [
      '经典台词场景',
      '夸张的肢体喜剧',
      '温情感人时刻'
    ],
    director: '周星驰',
    year: '1995-2005',
    genre: '喜剧'
  },
  '人在囧途': {
    name: '人在囧途',
    synopsis: '《人在囧途》是叶伟民执导的喜剧电影。讲述春运期间，商人李成功和讨债的牛耿意外结伴回家的故事。一路上发生各种囧事，展现了人间百态。',
    characters: [
      '李成功 - 商人',
      '牛耿 - 讨债的打工仔'
    ],
    scenes: [
      '火车站买票',
      '飞机迫降',
      '牛耿的"乌鸦嘴"灵验'
    ],
    director: '叶伟民',
    year: '2010',
    genre: '喜剧'
  }
}

export async function getMovieInfo(movieName: string): Promise<MovieInfo> {
  return MOVIE_DATABASE[movieName] || getFallbackMovieInfo(movieName);
}

export function getFallbackMovieInfo(movieName: string): MovieInfo {
  return {
    name: movieName,
    synopsis: '《' + movieName + '》是一部经典电影。本剧本将为您创作一个原创的产品植入故事。',
    characters: ['原创角色'],
    scenes: ['原创场景'],
    director: '未知',
    year: '未知',
    genre: '未知'
  };
}

// Search for movie info from web
export async function searchMovieFromWeb(movieName: string): Promise<{
  synopsis: string;
  characters: string[];
  scenes: string[];
  director: string;
  year: string;
} | null> {
  try {
    // Use Google Search to find movie information
    const searchQuery = `${movieName} 电影 故事简介 角色 经典桥段`;
    
    // This would be replaced with actual web search in production
    // For now, return null to use local database
    console.log('Searching for movie:', searchQuery);
    return null;
  } catch (error) {
    console.error('Error searching movie:', error);
    return null;
  }
}
