"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FileListComponent = void 0;
var core_1 = require("@angular/core");
var fileObject = /** @class */ (function () {
    function fileObject() {
    }
    return fileObject;
}());
var FileListComponent = /** @class */ (function () {
    function FileListComponent(fileService, middleWare) {
        this.fileService = fileService;
        this.middleWare = middleWare;
        this.fileList$ = [];
        //deckName emitter receiver
        this.deckNameEmitter = new core_1.EventEmitter();
    }
    FileListComponent.prototype.download = function (fileName) {
        //TODO: Dont have this hard coded! File names and ID's should be accesible
        fileName = fileName;
        this.fileService.download(fileName).subscribe(function (data) {
            //render base64 image to screen
            console.log(data);
            var outputImage = document.createElement('img');
            outputImage.height = 200;
            outputImage.width = 200;
            outputImage.src = 'data:image/jpg;base64,' + data;
            document.body.appendChild(outputImage);
        });
    };
    FileListComponent.prototype.remove = function (fileName) {
        this.fileService.remove(fileName);
    };
    FileListComponent.prototype.renderImages = function (imageArray) {
        imageArray.forEach(function (image) {
            var outputImage = document.createElement('img');
            outputImage.height = 200;
            outputImage.width = 200;
            outputImage.src = 'data:image/jpg;base64,' + image;
            document.getElementById("deckDisplay").appendChild(outputImage);
        });
    };
    FileListComponent.prototype.ngOnInit = function () {
        var _this = this;
        var userID = this.middleWare.getUsername();
        this.deckNameEmitter.subscribe(function (deckName) {
            _this.fileService.list(deckName, userID).subscribe(function (data) {
                console.log(data);
                _this.renderImages(data.dataFiles);
            });
        });
    };
    __decorate([
        core_1.Input()
    ], FileListComponent.prototype, "deckNameEmitter");
    FileListComponent = __decorate([
        core_1.Component({
            selector: 'app-file-list',
            templateUrl: './file-list.component.html',
            styleUrls: ['./file-list.component.scss']
        })
    ], FileListComponent);
    return FileListComponent;
}());
exports.FileListComponent = FileListComponent;
