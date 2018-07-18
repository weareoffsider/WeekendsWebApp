import {init as initI18next, i18n} from 'i18next'
import {DateTime} from 'luxon'

const NAIVE_DATETIME_FULL = Object.assign({}, DateTime.DATETIME_FULL, {
  timeZoneName: undefined,
})

export default class LocalizeContext {
  private i18next: i18n

  constructor (public langCode: string, localizationStores: any) {
    this.i18next = initI18next({
      lng: langCode,
      debug: true,
      initImmediate: false,
      resources: localizationStores,
    })

    this.formatDate = this.formatDate.bind(this)
    this.formatDateTimeNaive = this.formatDateTimeNaive.bind(this)
    this.formatDateTimeUTC = this.formatDateTimeUTC.bind(this)
    this.translate = this.translate.bind(this)
  }

  translate (key: string, params?: any) {
    return this.i18next.t(key, params)
  }

  formatDate (dateStr: string, format: string = "full") {
    const date = DateTime.fromISO(dateStr).setLocale(this.langCode)

    switch (format) {
      case "abbr":
        return date.toLocaleString(DateTime.DATE_SHORT)
      case "full":
        return date.toLocaleString(DateTime.DATE_FULL)
    }

    return date
  }

  formatDateTimeNaive (dtStr: string, format: string = "full") {
    const dt = DateTime.fromISO(dtStr).setLocale(this.langCode)

    switch (format) {
      case "abbr":
        return dt.toLocaleString(DateTime.DATETIME_SHORT)
      case "full":
        return dt.toLocaleString(NAIVE_DATETIME_FULL)
    }

    return dt
  }

  formatDateTimeUTC (dtStr: string, format: string = "full") {
    const dt = DateTime.fromISO(dtStr).setLocale(this.langCode)

    switch (format) {
      case "abbr":
        return dt.toLocaleString(DateTime.DATETIME_SHORT)
      case "full":
        return dt.toLocaleString(NAIVE_DATETIME_FULL)
      case "abbr-local":
        return dt.toLocaleString(DateTime.DATETIME_SHORT)
      case "full-local":
        return dt.toLocaleString(NAIVE_DATETIME_FULL)
      case "abbr-utc":
        return dt.setZone('utc').toLocaleString(DateTime.DATETIME_SHORT)
      case "full-utc":
        return dt.setZone('utc').toLocaleString(NAIVE_DATETIME_FULL)
    }

    return dt
  }
}
