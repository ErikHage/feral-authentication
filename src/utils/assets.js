import { assetBasePath } from "@/utils/constants";

export function getAssetPath(assetPathFromBase) {
    if (assetPathFromBase.startsWith("/")) {
        return `${assetBasePath}${assetPathFromBase}`;
    }
    return `${assetBasePath}/${assetPathFromBase}`;
}