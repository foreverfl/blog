interface LocaleMessages {
  categoryManagement: string;
  postManagement: string;
  createPost: string;
  myComments: string;
}

export interface Locales {
  ko: LocaleMessages;
  ja: LocaleMessages;
}

const locales: Locales = {
  ko: {
    categoryManagement: "카테고리 관리",
    postManagement: "포스트 관리",
    createPost: "포스트 작성",
    myComments: "내 댓글",
  },
  ja: {
    categoryManagement: "カテゴリ管理",
    postManagement: "ポスト管理",
    createPost: "投稿作成",
    myComments: "私のコメント",
  },
};

export default locales;
