declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getDayGan(): string;
    getDayZhi(): string;
    getMonthZhi(): string;
    getMonthGan(): string;
    getYearGan(): string;
    getYearZhi(): string;
  }
}
