import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as fabric from 'fabric';
import { log } from 'fabric/fabric-impl';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  private canvas!: fabric.Canvas;
  private scale: number = 0.3; // Échelle pour l'affichage à l'écran
  private realWidth: number = 2022; // Largeur réelle pour l'impression
  private realHeight: number = 1278; // Hauteur réelle pour l'impression

  fontFamily: string = '';
  fontSize: number = 16;
  fillColor: string = '#000000';
  text: string = 'Texte';


  @ViewChild('editionDiv') editionDiv!: ElementRef;
  selectedText: fabric.Textbox | null = null;

  urlMap = {
    VT323:
      'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
    Pacifico:
      'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)',
    Lato100:
      'url(https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-qNiXg7Q.woff2)',
    Lato900:
      'url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2)',
  };

  fontVT323 = new FontFace('VT323', this.urlMap.VT323, {
    style: 'normal',
    weight: 'normal',
  });
  fontPacifico = new FontFace('Pacifico', this.urlMap.Pacifico, {
    style: 'normal',
    weight: 'normal',
  });

  Lato100 = new FontFace('Lato100', this.urlMap.Lato100, {
    style: 'normal',
    weight: 'normal',
  });

  Lato900 = new FontFace('Lato900', this.urlMap.Lato900, {
    style: 'normal',
    weight: 'normal',
  });

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    // Initialiser le canvas Fabric.js avec une taille adaptée à l'écran
    this.canvas = new fabric.Canvas('fabricCanvas', {
      width: this.realWidth * this.scale,
      height: this.realHeight * this.scale
    });

    Promise.all([
      this.fontVT323.load(),
      this.fontPacifico.load(),
      this.Lato100.load(),
      this.Lato900.load()
    ]).then((fonts) => {
      fonts.forEach((font) => (document.fonts as FontFaceSet & { add: (font: FontFace) => void }).add(font));
      console.log('Polices chargées');
    });

    const deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    var deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    // A fix

    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = 'red';
    fabric.FabricObject.prototype.cornerStyle = 'circle';

    //fin a fix

    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();

    this.canvas.setDimensions({ width: this.realWidth, height: this.realHeight });
    this.canvas.setZoom(1);

    this.canvas.setDimensions({ width: currentWidth, height: currentHeight });
    this.canvas.setZoom(this.scale);

    this.canvas.backgroundColor = 'white';
    this.canvas.renderAll();

    this.canvas.on('selection:created', (e) => this.updateEditionText(e));
    this.canvas.on('selection:updated', (e) => this.updateEditionText(e));
    this.canvas.on('selection:cleared', () => this.clearEditionText());
  }

  private updateEditionText(event: Partial<fabric.TEvent<fabric.TPointerEvent>>): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      let objectType = '';
      if (activeObject.type === 'image') {
        objectType = 'image';
        this.selectedText = null;
      } else if (activeObject.type === 'textbox') {
        objectType = 'text';
        this.selectedText = activeObject as fabric.Textbox;
        this.fontFamily = this.selectedText.fontFamily || '';
        this.fontSize = this.selectedText.fontSize || 16;
        this.fillColor = this.selectedText.fill as string || '#000000';
        this.text = this.selectedText.text as string || '#000000';
      } else if (['rect', 'circle', 'triangle', 'line'].includes(activeObject.type)) {
        objectType = 'formes';
        this.selectedText = null;
      }
      console.log(`Élément sélectionné : ${objectType}`);
      //this.editionDiv.nativeElement.innerText = `Élément sélectionné : ${objectType}`;
      this.cdr.detectChanges();
      console.log(this.selectedText);
    }
  }

  updateTextColor(): void {
    if (this.selectedText) {
      this.selectedText.set('fill', this.fillColor);
      this.canvas.renderAll();
    }
  }

  updateTextInput(): void {
    if (this.selectedText) {
      this.selectedText.set('text', this.text);
      this.canvas.renderAll();
    }
  }


  // Efface le texte dans la div "edition"
  private clearEditionText(): void {
    console.log("clear");
    //this.editionDiv.nativeElement.innerText = '';
    this.selectedText = null;
  }

  changeFont(event: Event): void {
    const font = (event.target as HTMLSelectElement).value;
    if (this.selectedText) {
      this.selectedText.set('fontFamily', font);
      this.canvas.renderAll();
      console.log("change to " + font)
    }
  }

  increaseFontSize(): void {
    if (this.selectedText) {
      const currentSize = this.selectedText.fontSize || 16;
      this.selectedText.set('fontSize', currentSize + 7);
      this.canvas.renderAll();
    }
  }

  decreaseFontSize(): void {
    if (this.selectedText) {
      const currentSize = this.selectedText.fontSize || 16;
      if (currentSize > 2) {
        this.selectedText.set('fontSize', currentSize - 7);
        this.canvas.renderAll();
      }
    }
  }

  changeTextColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.selectedText) {
      this.selectedText.set('fill', color);
      this.canvas.renderAll();
    }
  }

  // Gestion du drag and drop
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Permet de détecter l'événement "drop"
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageURL = e.target?.result as string;

        const imgElement = new Image();
        imgElement.src = imageURL;

        imgElement.onload = () => {
          const imgInstance = new fabric.Image(imgElement, {
            scaleX: this.scale,
            scaleY: this.scale,
            left: this.canvas.width! / 2 - (imgElement.width * this.scale) / 2,
            top: this.canvas.height! / 2 - (imgElement.height * this.scale) / 2
          });

          // Ajouter un contrôle de recadrage
          (imgInstance.controls as any)['cropControl'] = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: 100,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => { },
            render: (ctx, left, top, _styleOverride, fabricObject) => {
              const cropIcon =
                "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20class%3D%22feather%20feather-crop%22%3E%3Cpath%20d%3D%22M6.13%201L6%2016a2%202%200%200%200%202%202h15%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M1%206.13L16%206a2%202%200%200%201%202%202v15%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E";

              const cropImg = new Image();
              cropImg.src = cropIcon;

              const size = 24;
              ctx.save();
              ctx.translate(left, top);
              ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
              ctx.drawImage(cropImg, -size / 2, -size / 2, size, size);
              ctx.restore();
            },
          });

          this.canvas.add(imgInstance);
          this.canvas.setActiveObject(imgInstance);
          this.canvas.renderAll();
        };
      };

      reader.readAsDataURL(file);
    }
  }



  addText(): void {
    const text = new fabric.Textbox('Correctly loaded lato100', {
      left: 350,
      top: 310,
      width: 200,
      fontSize: 200,
      fontWeight: 'normal',
      fontFamily: 'Lato900',
    });

    this.canvas.add(text);
    this.canvas.renderAll();
  }


  addBlueSquare(): void {
    const squareSize = 100 * this.scale; // Taille du carré
    const canvasCenterX = this.canvas.width! / 2;
    const canvasCenterY = this.canvas.height! / 2;

    // Créer le carré bleu
    const square = new fabric.Rect({
      left: canvasCenterX - squareSize / 2,
      top: canvasCenterY - squareSize / 2,
      fill: 'blue',
      width: squareSize,
      height: squareSize,
      objectCaching: false,
      stroke: 'black',
      strokeWidth: 2,
    });

    // Ajouter le contrôle de suppression
    (square.controls as any)['deleteControl'] = new fabric.Control({
      x: 0.5, // Position du contrôle
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: (eventData, transform) => {
        const targetCanvas = transform.target.canvas;
        if (targetCanvas) {
          targetCanvas.remove(transform.target); // Supprimer l'objet
          targetCanvas.requestRenderAll();
        }
      },
      render: (ctx, left, top, _styleOverride, fabricObject) => {
        const deleteIcon =
          "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

        const deleteImg = new Image();
        deleteImg.src = deleteIcon;

        const size = 24; // Taille de l'icône
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
        ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
        ctx.restore();
      },
    });

    this.canvas.add(square);
    this.canvas.renderAll();
  }


  resetRotation(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate(0);
      this.canvas.renderAll();
    }
  }

  rotate90(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + 90);
      this.canvas.renderAll();
    }
  }

  exportHighResolutionCanvas(): void {
    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();

    this.canvas.setDimensions({ width: this.realWidth, height: this.realHeight });
    this.canvas.setZoom(1);

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: 1
    });

    this.canvas.setDimensions({ width: currentWidth, height: currentHeight });
    this.canvas.setZoom(this.scale);

    const newTab = window.open();
    if (newTab) {
      newTab.document.body.style.backgroundColor = 'black';
      newTab.document.body.style.margin = '0';
      newTab.document.body.innerHTML = `<img src="${dataUrl}" alt="Exported Canvas" style="margin: auto; max-width: 100%; height: auto;">`;
    }
  }
}
