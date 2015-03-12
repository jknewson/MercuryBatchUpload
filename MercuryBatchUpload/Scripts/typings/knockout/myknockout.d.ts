/// <reference path="knockout.d.ts" />

interface KnockoutBindingHandlers {
    fadeVisible: KnockoutBindingHandler;
    datepicker: KnockoutBindingHandler;
    numeric: KnockoutBindingHandler;
    loading: KnockoutBindingHandler;
    modal: KnockoutBindingHandler;
}

interface KnockoutExtenders {
    nullValidation(target: any, option: any): KnockoutObservable<any>;
    validUserName(target: any, option: any): KnockoutObservable<any>;
    validPassword(target: any, option: any): KnockoutObservable<any>;
    detectionLimitValidation(target: any, option: any): KnockoutObservable<any>;
    unitValidation(target: any, option: any): KnockoutObservable<any>;
}