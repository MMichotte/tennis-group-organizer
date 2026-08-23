import type { Locale } from 'react-date-object';

/**
 * Locale objects for react-multi-date-picker (v4 only ships a few locales;
 * FR/NL are custom objects matching the gregorian_xx shape).
 */
export const calendarLocaleFr = {
  name: 'gregorian_fr',
  months: [
    ['Janvier', 'Jan'],
    ['Février', 'Fév'],
    ['Mars', 'Mar'],
    ['Avril', 'Avr'],
    ['Mai', 'Mai'],
    ['Juin', 'Juin'],
    ['Juillet', 'Juil'],
    ['Août', 'Août'],
    ['Septembre', 'Sept'],
    ['Octobre', 'Oct'],
    ['Novembre', 'Nov'],
    ['Décembre', 'Déc'],
  ],
  weekDays: [
    ['Samedi', 'Sam'],
    ['Dimanche', 'Dim'],
    ['Lundi', 'Lun'],
    ['Mardi', 'Mar'],
    ['Mercredi', 'Mer'],
    ['Jeudi', 'Jeu'],
    ['Vendredi', 'Ven'],
  ],
  digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  meridiems: [
    ['AM', 'am'],
    ['PM', 'pm'],
  ],
};

export const calendarLocaleNl = {
  name: 'gregorian_nl',
  months: [
    ['Januari', 'Jan'],
    ['Februari', 'Feb'],
    ['Maart', 'Mrt'],
    ['April', 'Apr'],
    ['Mei', 'Mei'],
    ['Juni', 'Jun'],
    ['Juli', 'Jul'],
    ['Augustus', 'Aug'],
    ['September', 'Sep'],
    ['Oktober', 'Okt'],
    ['November', 'Nov'],
    ['December', 'Dec'],
  ],
  weekDays: [
    ['Zaterdag', 'Za'],
    ['Zondag', 'Zo'],
    ['Maandag', 'Ma'],
    ['Dinsdag', 'Di'],
    ['Woensdag', 'Wo'],
    ['Donderdag', 'Do'],
    ['Vrijdag', 'Vr'],
  ],
  digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  meridiems: [
    ['AM', 'am'],
    ['PM', 'pm'],
  ],
};

export const calendarLocales: Record<string, Locale> = {
  fr: calendarLocaleFr as Locale,
  nl: calendarLocaleNl as Locale,
};
