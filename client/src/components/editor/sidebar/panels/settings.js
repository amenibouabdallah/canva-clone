"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colorPresets } from "@/config";
import { centerCanvas } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { Check, Palette, Move, Resize } from "lucide-react";
import { useState } from "react";

function SettingsPanel() {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [canvasWidth, setCanvasWidth] = useState(800); // Default width
  const [canvasHeight, setCanvasHeight] = useState(600); // Default height
  const { canvas, markAsModified } = useEditorStore();

  const handleColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleColorPresetApply = (getCurrentColor) => {
    setBackgroundColor(getCurrentColor);
  };

  const handleApplyChanges = () => {
    if (!canvas) return;
    canvas.set("backgroundColor", backgroundColor);
    canvas.renderAll();

    centerCanvas(canvas);
    markAsModified();
  };

  const handleCanvasResize = () => {
    if (!canvas) return;
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    canvas.renderAll();

    centerCanvas(canvas);
    markAsModified();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Choose Background Color</h3>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-2 mb-3">
          {colorPresets.map((color) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild="true">
                  <button
                    className={`w-8 h-8 rounded-md border transition-transform hover:scale-110 ${
                      color === backgroundColor
                        ? "ring-2 ring-offset-2 ring-primary"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorPresetApply(color)}
                  >
                    {color === backgroundColor && (
                      <Check className="w-4 h-4 text-white mx-auto drop-shadow-md" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="flex mt-3 space-x-2">
          <div className="relative">
            <Input
              type="color"
              value={backgroundColor}
              onChange={handleColorChange}
              className={"w-12 h-10 p-1 cursor-pointer"}
            />
            <Input
              type={"text"}
              value={backgroundColor}
              onChange={handleColorChange}
              className="flex-1"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        <Separator className="my-4" />
        <Button className="w-full" onClick={handleApplyChanges}>
          Apply Changes
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="flex items-center space-x-2 mb-4">
        <Move className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Edit Canvas Size</h3>
      </div>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Input
            type="number"
            value={canvasWidth}
            onChange={(e) => setCanvasWidth(Number(e.target.value))}
            placeholder="Width"
            className="flex-1"
          />
          <Input
            type="number"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(Number(e.target.value))}
            placeholder="Height"
            className="flex-1"
          />
        </div>
        <Button className="w-full mt-4" onClick={handleCanvasResize}>
          Apply Canvas Size
        </Button>
      </div>
    </div>
  );
}

export default SettingsPanel;
