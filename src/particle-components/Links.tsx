import Image from "next/image";

// Link to repository
const repositoryLink = {
  href: "https://github.com/Particle-Network/cyber-aa-connect",
  imgSrc: "https://static.particle.network/mintlify/snippets/logos/github.png",
  imgAlt: "GitHub Logo",
  text: "Check the repository",
};

// Indicate where the bulk of the code is
const codeText = {
  text: "Get started by editing",
  code: "src/app/page.tsx",
};

// Links and descriptions to the particle documentation
const links = [
  {
    href: "https://developers.particle.network",
    title: "Documentation →",
    description: "Find in-depth information about AuthCore features and API.",
  },
  {
    href: "https://dashboard.particle.network",
    title: "Dashboard →",
    description:
      "Manage your projects and team, View analytics data, Custom configuration.",
  },
  {
    href: "https://developers.particle.network/guides/wallet-as-a-service/waas/connect/web-quickstart",
    title: "Quickstart →",
    description: "Learn how to spin up a Connect project in 5 minutes.",
  },
  {
    href: "https://particle.network",
    title: "Particle Network →",
    description: "The L1 unifying all chains through Universal Accounts.",
  },
  {
    href: "https://docs.cyber.co/",
    title: "Cyber Documentation →",
    description:
      "Cyber is the first restaked Ethereum Layer 2 designed for social and optimized for mass adoption.",
  },
  {
    href: "https://docs.cyber.co/build-on-cyber/faucets",
    title: "Cyber Testnet Faucet →",
    description: "Claim testnet ETH daily.",
  },
];

// UI component
const LinksGrid = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-6 text-center">
        <a
          href={repositoryLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-purple-300 transition duration-300 flex items-center justify-center"
        >
          <img
            src={repositoryLink.imgSrc}
            alt={repositoryLink.imgAlt}
            className="w-4 h-4 mr-2" // Reduced the size to 16px (w-4 h-4)
          />
          {repositoryLink.text}
        </a>
      </h2>
      <p className="text-xl mb-12 text-center">
        {codeText.text}{" "}
        <code className="bg-gray-800 rounded p-1 text-purple-300">
          {codeText.code}
        </code>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {links.map((link, index) => {
          const isSecondaryLink = index >= links.length - 2; // Target last two links by index
          return (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`border p-6 rounded-lg hover:bg-gray-800 transition duration-300 ease-in-out transform hover:scale-105 ${
                isSecondaryLink ? "border-emerald-600" : "border-purple-500"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  isSecondaryLink ? "text-emerald-400" : "text-purple-400"
                }`}
              >
                {link.title}
              </h2>
              <p className="text-gray-300">{link.description}</p>
            </a>
          );
        })}
      </div>
    </>
  );
};

export default LinksGrid;
