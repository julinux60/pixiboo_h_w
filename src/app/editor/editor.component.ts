import { Component } from '@angular/core';
import * as fabric from 'fabric';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  private canvas!: fabric.Canvas;
  private scale: number = 0.2; // Échelle pour l'affichage à l'écran
  private realWidth: number = 2022; // Largeur réelle pour l'impression
  private realHeight: number = 1278; // Hauteur réelle pour l'impression

  ngOnInit(): void {
    // Initialiser le canvas Fabric.js avec une taille adaptée à l'écran
    this.canvas = new fabric.Canvas('fabricCanvas', {
      width: this.realWidth * this.scale,
      height: this.realHeight * this.scale
    });

    const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

  var deleteImg = document.createElement('img');
  deleteImg.src = deleteIcon;

// A fix

  fabric.FabricObject .prototype.transparentCorners = false;
fabric.FabricObject .prototype.cornerColor = 'red';
fabric.FabricObject .prototype.cornerStyle = 'circle';

//fin a fix

    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();

    this.canvas.setDimensions({ width: this.realWidth, height: this.realHeight });
    this.canvas.setZoom(1);

    this.canvas.setDimensions({ width: currentWidth, height: currentHeight });
    this.canvas.setZoom(this.scale);

    this.canvas.backgroundColor = 'white';
    this.canvas.renderAll();
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
            mouseUpHandler: (eventData, transform) => this.activateCropMode(transform.target as fabric.Image),
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


  activateCropMode(image: fabric.Image): void {
    const canvasElement = document.getElementById('fabricCanvas') as HTMLCanvasElement;
    const confirmButton = document.getElementById('crop-confirm') as HTMLButtonElement;
    const cancelButton = document.getElementById('crop-cancel') as HTMLButtonElement;

    // Afficher les boutons
    confirmButton.style.display = 'inline-block';
    cancelButton.style.display = 'inline-block';

    // Désactiver les contrôles de l'image
    image.selectable = false;
    image.evented = false;

    // Rectangle de recadrage qui correspond à la taille de l'image
    const cropRect = new fabric.Rect({
      left: image.left,
      top: image.top,
      width: image.width! * image.scaleX!,
      height: image.height! * image.scaleY!,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 2,
      selectable: true,
      hasBorders: true,
      hasControls: true,
      originX: 'left',
      originY: 'top'
    });

    // Limiter les déplacements et redimensionnements pour qu'il reste dans l'image
    cropRect.on('moving', () => this.keepCropRectWithinImage(cropRect, image));
    cropRect.on('scaling', () => this.keepCropRectWithinImage(cropRect, image));

    this.canvas.add(cropRect);
    this.canvas.setActiveObject(cropRect);
    this.canvas.renderAll();

    // Gestion des boutons
    confirmButton.onclick = () => {
      const cropLeft = (cropRect.left! - image.left!) / image.scaleX!;
      const cropTop = (cropRect.top! - image.top!) / image.scaleY!;
      const cropWidth = cropRect.width! / image.scaleX!;
      const cropHeight = cropRect.height! / image.scaleY!;

      // Création d'un nouveau canvas temporaire
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // Dessiner l'image source dans le canvas temporaire
        tempCtx.drawImage(
          image._element,
          cropLeft, // Décalage X
          cropTop,  // Décalage Y
          cropWidth, // Largeur à couper
          cropHeight, // Hauteur à couper
          0, // Position X dans le canvas temporaire
          0, // Position Y dans le canvas temporaire
          cropWidth, // Largeur dans le canvas temporaire
          cropHeight // Hauteur dans le canvas temporaire
        );

        // Créer une nouvelle image Fabric à partir du canvas temporaire
        const newImage = new fabric.Image(tempCanvas, {
          left: image.left! + cropRect.left!,
          top: image.top! + cropRect.top!,
          scaleX: image.scaleX,
          scaleY: image.scaleY
        });

        // Ajouter la nouvelle image au canvas principal
        this.canvas.add(newImage);
        this.canvas.remove(image); // Supprimer l'ancienne image
      }

      // Supprimer le rectangle et cacher les boutons
      this.canvas.remove(cropRect);
      confirmButton.style.display = 'none';
      cancelButton.style.display = 'none';
      this.canvas.renderAll();
    };

    cancelButton.onclick = () => {
      // Supprimer le rectangle et cacher les boutons
      this.canvas.remove(cropRect);
      image.selectable = true;
      image.evented = true;
      confirmButton.style.display = 'none';
      cancelButton.style.display = 'none';
      this.canvas.renderAll();
    };
  }

  // Méthode pour empêcher le rectangle de sortir de l'image
  private keepCropRectWithinImage(cropRect: fabric.Rect, image: fabric.Image): void {
    const rectLeft = cropRect.left!;
    const rectTop = cropRect.top!;
    const rectWidth = cropRect.width! * cropRect.scaleX!;
    const rectHeight = cropRect.height! * cropRect.scaleY!;

    const imageBounds = {
      left: image.left!,
      top: image.top!,
      right: image.left! + image.width! * image.scaleX!,
      bottom: image.top! + image.height! * image.scaleY!
    };

    // Contrainte gauche
    if (rectLeft < imageBounds.left) cropRect.left = imageBounds.left;
    // Contrainte haut
    if (rectTop < imageBounds.top) cropRect.top = imageBounds.top;
    // Contrainte droite
    if (rectLeft + rectWidth > imageBounds.right)
      cropRect.left = imageBounds.right - rectWidth;
    // Contrainte bas
    if (rectTop + rectHeight > imageBounds.bottom)
      cropRect.top = imageBounds.bottom - rectHeight;
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
