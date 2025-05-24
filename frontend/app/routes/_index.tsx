export default function Home() {
  return (
      <div className="container px-3 mx-auto dark:text-white text-lg" style={{ maxWidth: 720 }}>
        <h1 className="font-bold text-3xl pt-10 pb-8">Bienvenue dans la Pixel War Rezoleo</h1>
        <p className="pb-8">
          Faites place à votre imagination et montrez vos talents en terme de
          dessins et de créativité. N'hésitez pas à contacter d'autres personnes
          pour créer des alliances et des stratégies. {' '}
          <span className="font-bold">Nous voulons voir vos plus belles créations !!!</span>
        </p>
        <p className="pb-8">
          Vous avez accés à tout un tas de couleurs sur une palette de pixel
          pouvant s'aggrandir. Avec dans le futur la possibilité de téléverser
          des images pour les transformer en calque.
        </p>
        <p className="pb-8">
          Toute personne participant à la Pixel War Rezoleo doit cependant
          respecter la règle suivante : {' '}
          <span className="font-bold">
            chaque joueur est responsable de ces dessins, si un dessin est jugé
            peu convenable l'administrateur se réserve le droit de le supprimer
            et en cas de récidive de bannir le joueur.
          </span>
        </p>
        <p className="pb-8">
          Pour ceux qui veulent faire des dessins automatiquement, un script a
          été fait pour poser des pixels automatiquement. Pour l'utiliser, il
          suffit de cliquer sur le lien ci-dessous.
        </p>
        <a
          className="underline hover:text-gray-500"
          href="downloads/automate_pixel.zip"
          download="python_script_package.zip"
        >
          Télécharger le script
        </a>
      </div>
  );
}
