/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-25 20:55
 * @LastAuthor : itchaox
 * @LastTime   : 2024-04-11 14:10
 * @desc       :
 */
import { createI18n } from 'vue-i18n';
import en from './en.json';
import zh from './zh.json';
import ja from './ja.json';
import { bitable } from '@lark-base-open/js-sdk';

export const i18n = createI18n({
  locale: 'en',
  allowComposition: true, // 占位符支持
  messages: {
    en: en,
    zh: zh,
    ja: ja,
  },
});

bitable.bridge.getLanguage().then((lang) => {
  i18n.global.locale = lang;
});
