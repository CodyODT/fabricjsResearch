//research
"use client";
import { fabric } from "fabric";
import React, { useState, useEffect, useRef, createRef } from "react";
import { penguinSVG, alienSVG } from "@/components/emojiSVG";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";

const App = () => {
  const [canvas, setCanvas] = useState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [showEmojiList, setShowEmojiList] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(10);
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [showIframe, setShowIframe] = useState(false);

  const ref = useRef(null);
  const screenCaptureRef = useRef(null);

  useEffect(() => {
    const c = new fabric.Canvas(ref.current, {
      height: 600,
      width: 400,
    });

    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#2BEBC8";
    fabric.Object.prototype.cornerStyle = "rect";
    fabric.Object.prototype.cornerStrokeColor = "#2BEBC8";
    fabric.Object.prototype.cornerSize = 6;

    c.isDrawingMode = isDrawing;

    setCanvas(c);

    return () => {
      c.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushColor, brushSize, canvas]);

  const addEmoji = (svgString) => {
    fabric.loadSVGFromString(svgString, (objects, options) => {
      const svg = fabric.util.groupSVGElements(objects, options);
      svg.set({
        left: 100,
        top: 100,
        scaleX: 1,
        scaleY: 1,
      });

      canvas.add(svg);
      canvas.requestRenderAll();
    });
  };

  const saveAndGenerateQRCode = () => {
    html2canvas(document.body).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          setQrCodeURL(URL.createObjectURL(blob));
        } else {
          console.error("Failed to create Blob object.");
        }
      }, "image/png");
    });
  };

  const toggleDrawingMode = () => {
    const newDrawingState = !isDrawing;
    setIsDrawing(newDrawingState);
    if (canvas) {
      canvas.isDrawingMode = newDrawingState;
    }
  };

  const deleteSelectedObject = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.requestRenderAll(); // Refresh the canvas to show changes
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = () => {
          const image = new fabric.Image(imgObj);

          const scaleX = canvas.width / image.width;
          const scaleY = canvas.height / image.height;
          const scaleToFit = Math.min(scaleX, scaleY);

          if (scaleToFit < 1) {
            image.scale(scaleToFit);
          }

          image.set({
            left: 0,
            top: 0,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
          });

          canvas?.add(image);
          canvas?.sendToBack(image);
          canvas?.requestRenderAll();
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const EmojiList = () => (
    <div
      style={{
        position: "absolute",
        border: "2px solid black",
        padding: "20px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div onClick={() => addEmoji(alienSVG)} style={{ cursor: "pointer" }}>
        <div
          dangerouslySetInnerHTML={{ __html: alienSVG }}
          style={{ width: "50px", height: "50px" }}
        ></div>
        Alien
      </div>
      <div onClick={() => addEmoji(penguinSVG)} style={{ cursor: "pointer" }}>
        <div
          dangerouslySetInnerHTML={{ __html: penguinSVG }}
          style={{ width: "50px", height: "50px" }}
        ></div>
        Penguin
      </div>
    </div>
  );

  return (
    <div
      style={{
        border: "1px solid",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={ref}
        id="canvas"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
      {showIframe && (
        <iframe
          src="https://glasson.sk-global.biz/try-on/?s=40&g=6057"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            border: "solid",
            zIndex: 0,
          }}
          allow="camera"
        ></iframe>
      )}
      <div style={{ zIndex: 3 }}>
        <button onClick={() => setShowIframe(!showIframe)}>webcam</button>
        <button onClick={() => setShowEmojiList(!showEmojiList)}>😃</button>
        {showEmojiList && <EmojiList />}
        <button onClick={toggleDrawingMode}>✏️</button>
        <button onClick={deleteSelectedObject}>🗑️</button>
        <div>
          <label htmlFor="brushColor">Brush Color:</label>
          <input
            id="brushColor"
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brushSize">Brush Size:</label>
          <input
            id="brushSize"
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <input type="file" onChange={handleImageUpload} />
      <div>Drawing Mode: {isDrawing ? "ON" : "OFF"}</div>
      <button onClick={saveAndGenerateQRCode}>Generate QR Code</button>
      {qrCodeURL && (
        <div>
          <QRCode
            value={qrCodeURL}
            size={256}
            level={"H"}
            includeMargin={true}
          />
          <p>{qrCodeURL}</p>
        </div>
      )}
    </div>
  );
};

export default App;
