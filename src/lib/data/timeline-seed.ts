import type { TimelinePeriodSeed } from '$lib/types/timeline';

export const timelineSeed: TimelinePeriodSeed[] = [
	{
		id: 'medieval',
		name: 'Medieval Art',
		startYear: 500,
		endYear: 1400,
		description: 'Sacred, manuscript, mosaic, and early panel traditions before the Renaissance.',
		movements: [
			{
				id: 'byzantine-gothic',
				name: 'Byzantine and Gothic',
				startYear: 500,
				endYear: 1400,
				artists: [
					{ id: 'cimabue', name: 'Cimabue', birthYear: 1240, deathYear: 1302 },
					{ id: 'giotto', name: 'Giotto', birthYear: 1267, deathYear: 1337 },
					{ id: 'duccio', name: 'Duccio', birthYear: 1255, deathYear: 1319 }
				]
			}
		]
	},
	{
		id: 'renaissance',
		name: 'Renaissance',
		startYear: 1400,
		endYear: 1600,
		description: 'Humanism, perspective, anatomy, and renewed interest in classical antiquity.',
		movements: [
			{
				id: 'early-renaissance',
				name: 'Early Renaissance',
				startYear: 1400,
				endYear: 1490,
				artists: [
					{ id: 'fra-angelico', name: 'Fra Angelico', birthYear: 1395, deathYear: 1455 },
					{ id: 'masaccio', name: 'Masaccio', birthYear: 1401, deathYear: 1428 },
					{ id: 'sandro-botticelli', name: 'Sandro Botticelli', birthYear: 1445, deathYear: 1510 }
				]
			},
			{
				id: 'high-renaissance',
				name: 'High Renaissance',
				startYear: 1490,
				endYear: 1530,
				artists: [
					{ id: 'leonardo-da-vinci', name: 'Leonardo da Vinci', birthYear: 1452, deathYear: 1519 },
					{ id: 'michelangelo', name: 'Michelangelo', birthYear: 1475, deathYear: 1564 },
					{ id: 'raphael', name: 'Raphael', birthYear: 1483, deathYear: 1520 }
				]
			},
			{
				id: 'northern-renaissance',
				name: 'Northern Renaissance',
				startYear: 1430,
				endYear: 1600,
				artists: [
					{ id: 'jan-van-eyck', name: 'Jan van Eyck', birthYear: 1390, deathYear: 1441 },
					{
						id: 'albrecht-durer',
						name: 'Albrecht Durer',
						wikipediaTitle: 'Albrecht Dürer',
						birthYear: 1471,
						deathYear: 1528
					},
					{ id: 'hieronymus-bosch', name: 'Hieronymus Bosch', birthYear: 1450, deathYear: 1516 }
				]
			}
		]
	},
	{
		id: 'baroque-rococo',
		name: 'Baroque and Rococo',
		startYear: 1600,
		endYear: 1780,
		description: 'Drama, theatrical light, movement, ornament, and courtly refinement.',
		movements: [
			{
				id: 'baroque',
				name: 'Baroque',
				startYear: 1600,
				endYear: 1720,
				artists: [
					{ id: 'caravaggio', name: 'Caravaggio', birthYear: 1571, deathYear: 1610 },
					{ id: 'peter-paul-rubens', name: 'Peter Paul Rubens', birthYear: 1577, deathYear: 1640 },
					{ id: 'rembrandt', name: 'Rembrandt', birthYear: 1606, deathYear: 1669 },
					{
						id: 'diego-velazquez',
						name: 'Diego Velazquez',
						wikipediaTitle: 'Diego Velázquez',
						birthYear: 1599,
						deathYear: 1660
					},
					{
						id: 'artemisia-gentileschi',
						name: 'Artemisia Gentileschi',
						birthYear: 1593,
						deathYear: 1656
					}
				]
			},
			{
				id: 'rococo',
				name: 'Rococo',
				startYear: 1720,
				endYear: 1780,
				artists: [
					{ id: 'antoine-watteau', name: 'Antoine Watteau', birthYear: 1684, deathYear: 1721 },
					{
						id: 'francois-boucher',
						name: 'Francois Boucher',
						wikipediaTitle: 'François Boucher',
						birthYear: 1703,
						deathYear: 1770
					},
					{
						id: 'jean-honore-fragonard',
						name: 'Jean-Honore Fragonard',
						wikipediaTitle: 'Jean-Honoré Fragonard',
						birthYear: 1732,
						deathYear: 1806
					}
				]
			}
		]
	},
	{
		id: 'nineteenth-century',
		name: '19th Century',
		startYear: 1780,
		endYear: 1900,
		description: 'Academic painting gives way to modern subjects, realism, and optical experiment.',
		movements: [
			{
				id: 'neoclassicism-romanticism',
				name: 'Neoclassicism and Romanticism',
				startYear: 1780,
				endYear: 1850,
				artists: [
					{
						id: 'jacques-louis-david',
						name: 'Jacques-Louis David',
						birthYear: 1748,
						deathYear: 1825
					},
					{ id: 'j-m-w-turner', name: 'J. M. W. Turner', birthYear: 1775, deathYear: 1851 },
					{
						id: 'eugene-delacroix',
						name: 'Eugene Delacroix',
						wikipediaTitle: 'Eugène Delacroix',
						birthYear: 1798,
						deathYear: 1863
					}
				]
			},
			{
				id: 'realism',
				name: 'Realism',
				startYear: 1840,
				endYear: 1880,
				artists: [
					{ id: 'gustave-courbet', name: 'Gustave Courbet', birthYear: 1819, deathYear: 1877 },
					{
						id: 'jean-francois-millet',
						name: 'Jean-Francois Millet',
						wikipediaTitle: 'Jean-François Millet',
						birthYear: 1814,
						deathYear: 1875
					},
					{
						id: 'honore-daumier',
						name: 'Honore Daumier',
						wikipediaTitle: 'Honoré Daumier',
						birthYear: 1808,
						deathYear: 1879
					}
				]
			},
			{
				id: 'impressionism',
				name: 'Impressionism',
				startYear: 1860,
				endYear: 1890,
				artists: [
					{ id: 'claude-monet', name: 'Claude Monet', birthYear: 1840, deathYear: 1926 },
					{
						id: 'pierre-auguste-renoir',
						name: 'Pierre-Auguste Renoir',
						birthYear: 1841,
						deathYear: 1919
					},
					{ id: 'edgar-degas', name: 'Edgar Degas', birthYear: 1834, deathYear: 1917 },
					{ id: 'berthe-morisot', name: 'Berthe Morisot', birthYear: 1841, deathYear: 1895 }
				]
			},
			{
				id: 'post-impressionism',
				name: 'Post-Impressionism',
				startYear: 1880,
				endYear: 1905,
				artists: [
					{
						id: 'paul-cezanne',
						name: 'Paul Cezanne',
						wikipediaTitle: 'Paul Cézanne',
						birthYear: 1839,
						deathYear: 1906
					},
					{ id: 'vincent-van-gogh', name: 'Vincent van Gogh', birthYear: 1853, deathYear: 1890 },
					{ id: 'paul-gauguin', name: 'Paul Gauguin', birthYear: 1848, deathYear: 1903 },
					{ id: 'georges-seurat', name: 'Georges Seurat', birthYear: 1859, deathYear: 1891 }
				]
			}
		]
	},
	{
		id: 'modernism',
		name: 'Modernism',
		startYear: 1900,
		endYear: 1970,
		description: 'Avant-garde movements reshape representation, abstraction, and artistic intent.',
		movements: [
			{
				id: 'expressionism',
				name: 'Expressionism',
				startYear: 1905,
				endYear: 1930,
				artists: [
					{ id: 'edvard-munch', name: 'Edvard Munch', birthYear: 1863, deathYear: 1944 },
					{ id: 'wassily-kandinsky', name: 'Wassily Kandinsky', birthYear: 1866, deathYear: 1944 },
					{ id: 'egon-schiele', name: 'Egon Schiele', birthYear: 1890, deathYear: 1918 }
				]
			},
			{
				id: 'cubism',
				name: 'Cubism',
				startYear: 1907,
				endYear: 1920,
				artists: [
					{ id: 'pablo-picasso', name: 'Pablo Picasso', birthYear: 1881, deathYear: 1973 },
					{ id: 'georges-braque', name: 'Georges Braque', birthYear: 1882, deathYear: 1963 },
					{ id: 'juan-gris', name: 'Juan Gris', birthYear: 1887, deathYear: 1927 }
				]
			},
			{
				id: 'surrealism',
				name: 'Surrealism',
				startYear: 1924,
				endYear: 1960,
				artists: [
					{
						id: 'salvador-dali',
						name: 'Salvador Dali',
						wikipediaTitle: 'Salvador Dalí',
						birthYear: 1904,
						deathYear: 1989
					},
					{
						id: 'rene-magritte',
						name: 'Rene Magritte',
						wikipediaTitle: 'René Magritte',
						birthYear: 1898,
						deathYear: 1967
					},
					{
						id: 'joan-miro',
						name: 'Joan Miro',
						wikipediaTitle: 'Joan Miró',
						birthYear: 1893,
						deathYear: 1983
					}
				]
			}
		]
	}
];
