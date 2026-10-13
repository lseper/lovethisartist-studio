/*
  Per-post display rotation (clockwise degrees), keyed by artwork id.

  Some e621 uploads are stored rotated; this corrects them client-side with a
  CSS transform at display time. Kept out of the generated manifest so it
  survives `npm run import:e621`. (Canvas re-encoding isn't an option: e621's
  CDN only allows CORS from e621.net.)
*/

export type Rotation = 0 | 90 | 180 | 270;

export const ROTATIONS: Record<string, Rotation> = {
  // Stored rotated 90° left → turn right 90°.
  "6205956": 90,
  "6168255": 90,
  "6165973": 90,
  "5661127": 90,
};
