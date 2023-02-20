import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';

interface Coordinates {
  x: number,
  y: number
}

interface RectangleSize {
  top: number,
  left: number,
  height: number,
  width: number
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  private cropSize: RectangleSize = {top: 0, left: 0, height: 0, width: 0}

  public isClippedImageLoaded: boolean = false;

  public cropFrom: Coordinates = {x: 0, y: 0};
  public cropTo: Coordinates = {x: 0, y: 0};

  public image: File|null = null;
  public imageName: string = "";
  public imageNames: string[] = [];

  public src: string = "";
  public croppedSrc: string = "";

  constructor(private imageService: ImageService) { }

  public ngOnInit(): void {
    this.imageService
      .getAllImageNames()
      .subscribe(names => this.imageNames = names);
  }

  public onFilechange(event: any): void {
    this.image = event.target.files[0];
  }

  public upload(): void {
    if (this.image) {
      this.imageService
        .upload(this.image)
        .subscribe(imageName => {
          this.imageName = imageName;
          if (this.imageNames.findIndex(element => element === imageName) === -1) {
            this.imageNames.push(imageName);
          }
          this.imageNameSelected();
        })
    } else {
      alert("Please, select an image first")
    }
  }

  public download() {
    this.imageService.downloadCroppedImage(this.imageName);
  }

  public imageNameSelected(): void {
    this.updatePathToImage();
    this.updatePathToCroppedImage();
  }
  
  public mouseDown(event: any): void {
    this.cropFrom = {x: event.offsetX, y: event.offsetY};
  }
  
  public mouseUp(event: any): void {
    this.cropTo = {x: event.offsetX, y: event.offsetY};
    this.cropSize = this.computeCropSize(this.cropFrom, this.cropTo);

    const box = document.querySelector(".box") as HTMLElement;
    
    box.style.top = this.cropSize.top + "px";
    box.style.left = this.cropSize.left + "px";
    box.style.height = this.cropSize.height + "px";
    box.style.width = this.cropSize.width + "px";
  }
  
  public crop(): void {
    const img = document.getElementById("image") as HTMLElement;
    
    this.imageService
    .cropImage(
      this.cropSize.top / img.clientHeight,
      this.cropSize.left / img.clientWidth,
      this.cropSize.height / img.clientHeight,
      this.cropSize.width / img.clientWidth,
      this.imageName
    )
    .subscribe(res => {
      this.updatePathToCroppedImage();
    });
  }

  private computeCropSize(cropFrom: Coordinates, cropTo: Coordinates): RectangleSize {
    return {
      top: Math.min(cropFrom.y, cropTo.y),
      left: Math.min(cropFrom.x, cropTo.x),
      height: Math.abs(cropFrom.y - cropTo.y),
      width: Math.abs(cropFrom.x - cropTo.x)
    };
  }
  
  private updatePathToImage(): void {
    this.src = this.imageService.getImage(this.imageName);
  }

  private updatePathToCroppedImage(): void {
    this.croppedSrc = this.imageService.getCroppedImage(this.imageName);
  }
}
