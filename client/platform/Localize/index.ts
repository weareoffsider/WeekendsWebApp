import {init as initI18next, i18n} from 'i18next'

export default class LocalizeContext {
  private i18next: i18n

  constructor (public langCode: string, localizationStores: any) {
    this.i18next = initI18next({
      lng: langCode,
      debug: true,
      initImmediate: false,
      resources: localizationStores,
    })

    this.translate = this.translate.bind(this)
  }

  translate (key: string, params?: any) {
    return this.i18next.t(key, params)
  }
}
