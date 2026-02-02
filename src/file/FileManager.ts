import type { ShapeDTO } from "@core/types/ShapeDTO";
import { SketcherCore } from "@core/SketcherCore";

export class FileManager {
    static save(sketcher: SketcherCore, filename = "sketch.json"): void {
        const data: ShapeDTO[] = sketcher.toJSON();

        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }

    static load(file: File): Promise<ShapeDTO[]> {
        return new Promise((resolve, reject) =>{
            const reader = new FileReader();

            reader.onload =  () => {
                try{
                    const json = reader.result as string;
                    const data = JSON.parse(json) as ShapeDTO[];
                    resolve(data);
                }
                catch(error){
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);

            reader.readAsText(file);
        });
    }
}