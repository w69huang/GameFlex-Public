"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
function popupClose(popupScene, deck, component) {
    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}
var PopupScene = /** @class */ (function (_super) {
    __extends(PopupScene, _super);
    function PopupScene(handle, x, y, component, deck, width, height, optionObjects, optionSeparation) {
        var _this = _super.call(this, handle) || this;
        _this.key = handle;
        _this.x = x;
        _this.y = y;
        _this.component = component;
        _this.deck = deck;
        _this.width = width;
        _this.height = height;
        _this.optionObjects = optionObjects;
        _this.optionSeparation = optionSeparation;
        return _this;
    }
    PopupScene.prototype.create = function () {
        var _this = this;
        this.cameras.main.setViewport(this.x, this.y, this.width, this.height);
        var popup = this.add.image(0, 0, 'grey-background').setOrigin(0);
        popup.displayWidth = this.width;
        popup.displayHeight = this.height;
        var closeButton = this.add.image(225, 0, 'close').setOrigin(0);
        closeButton.setInteractive();
        closeButton.on('pointerdown', popupClose.bind(this, this, this.deck, this.component));
        closeButton.displayWidth = 25;
        closeButton.displayHeight = 25;
        var verticalPosition = 0;
        this.optionObjects.forEach(function (object) {
            var button = _this.add.image(0, verticalPosition, object.optionKey).setOrigin(0);
            button.setInteractive();
            button.on('pointerdown', object.optionFunction.bind(_this, _this, _this.deck, _this.component));
            button.displayWidth = object.optionWidth;
            button.displayHeight = object.optionHeight;
            verticalPosition += object.optionHeight + _this.optionSeparation;
        });
    };
    PopupScene.prototype.preload = function () {
        var _this = this;
        this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
        this.load.image('close', 'assets/images/buttons/close.png');
        this.optionObjects.forEach(function (object) {
            _this.load.image(object.optionKey, object.optionImage);
        });
    };
    return PopupScene;
}(Phaser.Scene));
exports["default"] = PopupScene;
