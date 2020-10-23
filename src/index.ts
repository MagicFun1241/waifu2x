import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import {nanoid} from "nanoid";
import {spawn} from "child_process";
import {binaryDirectory, tempDirectory} from "./directories";

const executablePath = path.join(__dirname, "../bin", os.platform() === 'win32' ? 'waifu2x-converter-cpp.exe' : 'waifu2x-converter-cpp');

type Noise = 0 | 1 | 2 | 3;

export enum Mode {
    Noise = "noise",
    Scale = "scale",
    NoiseScale = "noise-scale"
}

interface Waifu2X {
    mode: (value: Mode) => Waifu2X;
    noise: (value: Noise) => Waifu2X;
    scale: (value: number) => Waifu2X;

    toFile: (path: string) => Promise<void>;
    toBuffer: () => Promise<Buffer>;
}

function convert(input: string, output: string, options: {
    mode: Mode;
    noise: Noise;
    scale: number;
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const args = [
            "-i",
            input,
            "-o",
            output
        ];

        switch (options.mode) {
            case Mode.Noise:
                args.push("--noise-level", options.noise.toString());
                break;

            case Mode.Scale:
                args.push("--scale-ratio", options.scale.toString());
                break;

            case Mode.NoiseScale:
                args.push(
                    "--noise-level",
                    options.noise.toString(),
                    "--scale-ratio",
                    options.scale.toString()
                );
                break;
        }

        const child = spawn(executablePath, args, {
            cwd: binaryDirectory
        });

        child.on("exit", () => {
            resolve();
        });
    });
}

function waifu2x(input: string): Waifu2X {
    let mode = Mode.NoiseScale;
    let scale = 2;
    let noise: Noise = 1;
    
    const context: Waifu2X = {
        toBuffer(): Promise<Buffer> {
            return new Promise<Buffer>((resolve, reject) => {
                const tmp = path.join(tempDirectory, nanoid(12));
                convert(input, tmp, {
                    mode: mode,
                    noise: noise,
                    scale: scale
                }).then(() => {
                    resolve(fs.readFileSync(tmp));
                }).catch(err => reject(err));
            });
        },
        toFile(path: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                convert(input, path, {
                    mode: mode,
                    noise: noise,
                    scale: scale
                }).then(() => {
                    resolve();
                }).catch(err => reject(err));
            });
        },
        scale: value => {
            scale = value;
            return context;
        },
        noise: (value: Noise) => {
            noise = value;
            return context;
        },
        mode: value => {
            mode = value;
            return context;
        }
    }

    return context;
}

export default waifu2x;