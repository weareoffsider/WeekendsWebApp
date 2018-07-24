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
      initImmediate: false,
      resources: localizationStores,
    })

    this.formatDate = this.formatDate.bind(this)
    this.formatDateTimeNaive = this.formatDateTimeNaive.bind(this)
    this.formatDateTimeUTC = this.formatDateTimeUTC.bind(this)
    this.formatNumber = this.formatNumber.bind(this)
    this.formatStorageSize = this.formatStorageSize.bind(this)
    this.formatCurrency = this.formatCurrency.bind(this)
    this.formatPercentage = this.formatPercentage.bind(this)
    this.translate = this.translate.bind(this)
  }

  // STRING TRANSLATION
  translate (key: string, params?: any) {
    return this.i18next.t(key, params)
  }

  // DATE AND TIME FORMATTING
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

  // NUMBER FORMATTING
  formatNumber(num: number) {
    return new Intl.NumberFormat(this.langCode).format(num)
  }

  formatStorageSize(num: number, format: string = "abbr-reduce") {
    const getUnit = (unit: string) => { 
      if (format.indexOf("abbr") == 0) {
        return this.translate('storage_size_units.abbr.' + unit)
      } else {
        return this.translate('storage_size_units.full.' + unit)
      }
    }


    if (format == "abbr-reduce" || format == "full-reduce") {
      let stepper = num
      let steps = 0

      while (stepper > 1024) {
        stepper = stepper / 1024
        steps++
      }

      const suffix = (() => {switch (steps) {
        case 0: return getUnit('bytes')
        case 1: return getUnit('kilobytes')
        case 2: return getUnit('megabytes')
        case 3: return getUnit('gigabytes')
        case 4: return getUnit('terabytes')
        case 5: return getUnit('petabytes')
        default: return "?"
      }})()

      return (
        new Intl.NumberFormat(this.langCode, {
          maximumFractionDigits: steps == 0 ? 0 : 1
        }).format(stepper) + suffix
      )
    } else {
      return (
        new Intl.NumberFormat(this.langCode).format(num) + " " +
        this.translate('storage_size_units.abbr.bytes')
      )
    }
  }

  formatCurrency(num: number, currencyCode: string, format: string = "full") {
    if (format == "abbr-auto") {
      let stepper = num
      let steps = 0

      while (stepper > 1000) {
        stepper = stepper / 1000
        steps++
      }

      const suffix = (() => {switch (steps) {
        case 0: 
          return ""
        case 1: 
          return this.translate('currency_abbreviations.thousand')
        case 2: 
          return this.translate('currency_abbreviations.million')
        case 3: 
          return this.translate('currency_abbreviations.billion')
        case 4: 
          return this.translate('currency_abbreviations.trillion')
        case 5: 
          return this.translate('currency_abbreviations.quadrillion')
        default:
          return "?"
      }})()

      return new Intl.NumberFormat(
        this.langCode,
        {style: 'currency', currency: currencyCode}
      ).format(stepper) + suffix
    } else if (format == "abbr-thousands") {
      return new Intl.NumberFormat(
        this.langCode,
        {style: 'currency', currency: currencyCode}
      ).format(num / 1000) + this.translate('currency_abbreviations.thousand')
    }

    return new Intl.NumberFormat(
      this.langCode,
      {style: 'currency', currency: currencyCode}
    ).format(num)
  }

  formatPercentage(num: number) {
    return new Intl.NumberFormat(
      this.langCode,
      {style: 'percent'}
    ).format(num)
  }

}
