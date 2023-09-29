import { getAllWorks } from './fetch.js'

const works = await getAllWorks()
const htmlGalleryElement = document.querySelector('.gallery')
if (htmlGalleryElement === null) {
  throw new Error(
    'The CSS class "gallery" has been removed from the HTML file. Please put it back in it again.'
  )
}
for (let work of works) {
  htmlGalleryElement.innerHTML += `<figure>
					<img src=${work.imageUrl} alt=${work.title}>
					<figcaption>${work.title}</figcaption>
				</figure>`
}
