# AIR
Article International Representation for the course of Information Visualization @VUB 2017

## Requirements
### Question 1 - Graph
- [x] Be able to give an article(title)/author? as input
- [x] See the articles a paper is referenced in / referenced by (as a graph)
- [x] Be able to get all the metadata (by hovering on a node)
- [x] Be able to click on another node of the graph and center the viz on it (aka being able to see the articles it is referenced in / referenced by). This way, by always clicking on the referenced papers, we can track down one of the founding papers.
- [ ] The founding papers should be easily accessible (through a button for example). 
- [ ] Same goes for going back to the user's paper.

### Question 2 - Map
- [x] Being able to see where an article's authors are/were located (at the time of release) (can be multiple places) on a map.
- [x] Same goes for the **referenced** papers.
- [x] Same goes for the **referencing** papers.
- [x] Easy way for the user to choose which information gets shown.

### Technical
- [x] Visualizations in D3.js
- [ ] Respect the course conventions

### Extras
- [ ] Be able to look for a keyword and see the "locations" of the papers having that word as a keyword.

## Conventions
### Founding paper
A founding paper is a scientific paper that bootstraps a topic and doesn't reference any other paper on that topic. The topic of a paper is determined by its keywords.
### Location of a paper
The location of a paper is the locations of the authors at the time the paper is published. Only the main authors are taken into account. The main authors are determined with a weight factor.
