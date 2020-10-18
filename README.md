# waifu2x
Image upscale library

## Supported platforms
1. Windows
2. Linux (Raspberry Pi 4)

## Examples
```typescript
import waifu2x from "@magicfun1241/waifu2x";

waifu2x(path.join(cwd, 'input.jpg')).noise(3).toFile(path.join(cwd, 'output.jpg')).then(() => {
    console.log("Done!");
});
```

## License
MIT