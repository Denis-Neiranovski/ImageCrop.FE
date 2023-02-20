import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly serverPath: string = "https://localhost:7092";

  constructor(private http: HttpClient) {}

  public getAllImageNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.serverPath}/api/image`);
  } 

  public upload(image: File): Observable<string> {
    const formParams = new FormData();
    formParams.append('file', image);
    
    return this.http.post<string>(`${this.serverPath}/api/image/upload`, formParams);
  }

  public getImage(imageName: string): string {
    return `${this.serverPath}/Images/${imageName}?${new Date().getTime()}`;
  }

  public getCroppedImage(imageName: string): string {
    return `${this.serverPath}/CroppedImages/${imageName}?${new Date().getTime()}`;
  }

  public cropImage(relativeTop: number, relativeLeft: number, relativeHeight: number, relativeWidth: number, imageName: string): Observable<string> {
    const params = new HttpParams({
      fromObject: {relativeTop, relativeLeft, relativeWidth, relativeHeight, imageName}
    });
    
    return this.http.get<string>(`${this.serverPath}/api/image/crop`, {params: params});
  }

  public downloadCroppedImage(imageName: string): void {
    const params = new HttpParams({
      fromObject: {imageName}
    });

    this.http
      .get(`${this.serverPath}/api/image/downloadCroppedImage`, {params: params, responseType: "blob"})
      .subscribe(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
}
