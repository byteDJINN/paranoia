// import { writeable } from 'svelte/store';

// function createFavoritesStore() {
//   const { subscribe, set, update } = writeable([]);

//   return {
//     subscribe,
//     toggle: (id) => update(favorites => {
//         if (favorites.includes(id)) {
//             return favorites.filter(fav => fav !== id);
//         } else {
//             return [...favorites, id];
//         }
//         }),
//   };
// }

// export const favorites = createFavoritesStore();
