import * as model from "../model/model.js";
import recipeView from "../view/recipeView.js";
import searchView from "../view/searchView.js";
import resultsView from "../view/resultsView.js";
import bookmarksView from "../view/bookmarksView.js";
import paginationView from "../view/paginationView.js";
import addRecipeView from "../view/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1 Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2 Loading recipe
    await model.loadRecipe(id);

    //3 Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(`${err}💣💣💣`);
  }
};

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinner();
    console.log("resultsView:", resultsView);
    //1 Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2 Load search results
    await model.loadSearchResults(query);

    //3 Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4 Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = (goToPage) => {
  //1 Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2 Render NEW pagination buttons
  paginationView.render(model.state.search);
  console.log(goToPage);
};

const controlServings = (newServings) => {
  //Update the receipe servings (in state)
  model.updateServings(newServings);

  //Update the receipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  //1 Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2 Update recipe view
  recipeView.update(model.state.recipe);

  //3 Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async (newRecipe) => {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();
    //Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
