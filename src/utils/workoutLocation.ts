const toRad = (deg: number) => (deg * Math.PI) / 180;

const distanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

export const classifyWorkoutLocations = (workouts: any[]) => {
  return workouts.map((w) => {
    const sameArea = workouts.filter((candidate) => {
      if (!candidate?.lat || !candidate?.lng || !w?.lat || !w?.lng) return false;
      return distanceMeters({ lat: w.lat, lng: w.lng }, { lat: candidate.lat, lng: candidate.lng }) <= 50;
    });

    return {
      ...w,
      locationType: sameArea.length > 1 ? 'indoor' : 'outdoor',
    };
  });
};
