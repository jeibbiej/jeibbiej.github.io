import * as Traits from "./traits.js";

export class Genome
{
	constructor(dna, tree, isTraits = false)
	{
		this.raw = String(dna);
		if (!(tree instanceof Genome))
			this.tree = this.initGenome();
		else
			this.tree = tree;
		if (isTraits)
			this.tree = this.initTraits();
		this.obj = this.readObject(this.raw, this.tree);
	}

	readMultibyte(dna, pos)
	{
		let n = 0;
		let num = 0;
		let shift = 0;
		let i = 0;
		do
		{
			let a = parseInt(dna[pos + i++], 16);
			let b = parseInt(dna[pos + i++], 16);
			n = (b << 4) | a;
			num += ((n & 0x07F) << shift) >>> 0;
			shift += 7;
		} while (n >>> 7);

		return [num, i];
	}

	readString(dna)
	{
		let str = "";
		for (let i = 0; i < dna.length;)
		{
			let [opcode, sz] = this.readMultibyte(dna, i);
			i += sz;
			str += String.fromCharCode(opcode);
		}
		return str;
	}

	readFloat(dna)
	{
		let num = 0;
		let shift = 0;
		for (let i = 0; i < 8;)
		{
			let a = parseInt(dna[i++], 16);
			let b = parseInt(dna[i++], 16);

			let tmp = a | (b << 4);
			num |= tmp << shift;
			shift += 8;
		}

		let buff = new ArrayBuffer(4);
		let view = new DataView(buff);
		view.setUint32(0, num, true);

		return view.getFloat32(0, true);
	}

	readArr_Enum(dna, enumList)
	{
		let arr = [];
		for (let i = 0; i < dna.length;)
		{
			let [opcode, sz] = this.readMultibyte(dna, i);
			i += sz;
			arr.push("_____" + enumList[opcode] + "_____");
		}
		return arr;
	}

	readObject(dna, tree)
	{
		let obj = {};
		for (let i = 0; i < dna.length;)
		{
			let [opcode, sz] = this.readMultibyte(dna, i);
			i += sz;

			let type = opcode & 0x07;
			let key = opcode >>> 3;

			let genes = tree["genes"];
			let gene = genes[key];

			// check if valid key
			if (!genes.hasOwnProperty(key))
			{
				let err = `Unkown key ${key} of type `;
				switch (type)
				{
					case 0: err += "multibyte integer"; break;
					case 2: err += "object"; break;
					case 5: err += "float"; break;
					default: err += `unknown (${type})`;
				}
				err += ` for gene '${tree["name"]}' found at ${i}. DNA sequence: ` + dna;
				obj["ERROR"] = err;
				return obj;
			}

			let keyName = gene["name"];
			if (keyName == "")
				msg;

			// check if declared as array
			if (obj.hasOwnProperty(keyName) &&
				!gene.isArray)
			{
				obj["ERROR"] = `Key ${key} ('${keyName}') for gene '${tree["name"]}' is already existing and is not defined as array.`;
				return obj;
			}

			let val = {};
			let isEnum = (Object.keys(gene.enumList).length > 0);

			switch (type)
			{
				case 0: // xxxx x000 multibyte integer
				{
					[val, sz] = this.readMultibyte(dna, i);
					i += sz;
					if (isEnum)
					{
						if (gene.enumList.hasOwnProperty(val))
							val = "_____" + gene.enumList[val] + "_____"
						else
							obj["ERROR"] = `Unknown enum value ${val} for gene '${tree["name"]}' was encountered.`;
					}
					break;
				}
				case 2: // xxxx x010 object
				{
					// read next multi-byte as size
					let [objSz, sz] = this.readMultibyte(dna, i);
					i += sz;
					objSz *= 2; // two nibbles
					let subDna = dna.substring(i, i + objSz);

					if (gene.isStr)
						val = this.readString(subDna);
					else if (isEnum)
						val = this.readArr_Enum(subDna, gene.enumList)
					else
						val = this.readObject(subDna, gene);

					// check if forced to have value
					for (let g in gene.genes)
					{
						if (gene.genes[g].default != null &&
							!val.hasOwnProperty(gene.genes[g].name))
							val[gene.genes[g].name] = gene.genes[g].default;
					}

					i += objSz;
					break;
				}
				case 5: // xxxx x101 float
				{
					let subDna = dna.substring(i, i + 8);
					val = this.readFloat(subDna);

					i += 8;
					break;
				}
				default:
				{
					obj["ERROR"] = `Unkown type ${type} for gene '${tree["name"]}' found at ${i}. DNA sequence: ` + dna;
					return obj;
				}
			}

			if (gene.isArray)
			{
				if (!Array.isArray(obj[keyName]))
					obj[keyName] = [];
				obj[keyName].push(val);
			}
			else
				obj[keyName] = val;
		}

		return obj;
	}

	static Gene = class
	{
		constructor(name, genes = {}, isArray = false, isStr = false, enumList = {}, defVal = null)
		{
			this.name = name;
			this.genes = genes;
			this.isArray = isArray;
			this.isStr = isStr;
			this.enumList = enumList;
			this.default = defVal;
		}
	};

	initTraits()
	{
		//==================================================
		// ENUM
		let eFaceMask =
		{
			0x00: "Undefined",
			0x0A: "Blob_Asymetical",
			0x0B: "Diamond",
			0x0C: "Heart_Short",
			0x0D: "Monkey",
			0x0E: "Octopus",
			0x0F: "Round",
			0x10: "Skull_Animal",
			0x11: "Star",
			0x12: "Venetian",
			0x13: "Bandit",
			0x14: "Cloud",
			0x15: "Dots",
			0x16: "Bolt",
			0x17: "Owl",
			0x18: "Goggles",
			0x19: "Triangles",
			0x1A: "Fold",
			0x1B: "Kawaii",
		};

		let eLikes =
		{
			0x00: "Ordinary",
			0x01: "Picky",
			0x02: "Bon_Vivant",
			0x03: "Power_Napper",
			0x04: "Energetic",
		};

		let eIridescenceDirection =
		{
			0x00: "Clockwise",
			0x01: "Counter_Clockwise",
			0x02: "Either",
		};

		let eBodyPart =
		{
			0x00: "Undefined",
			0x0A: "Crest",
			0x0B: "Saddle",
			0x0C: "Flank",
			0x0D: "Neck",
			0x0E: "Back_Legs",
			0x0F: "Front_Legs",
			0x10: "Forehead",
			0x11: "Head_Tuft",
			0x12: "Crest_Fore",
			0x13: "Wings",
			0x14: "Beard",
			0x15: "Cheeks",
			0x16: "Eartufts",
			0x17: "Eyebrows",
			0x18: "Spine",
		};

		let eBlendMode =
		{
			0x00: "Undefined",
			0x01: "Any",
			0x02: "Add",
			0x03: "Subtract",
			0x04: "Multiply",
			0x05: "Invisible",
		};

		let eMaskType =
		{
			0x00: "Undefined",
			0x01: "Pattern",
			0x02: "Procedural",
			0x03: "Any",
		};

		let ePatternType =
		{
			0x00: "Undefined",
			0x0A: "Gradient_Dorsal",
			0x0B: "Gradient_Front",
			0x0C: "Blotches",
			0x0D: "Boho_Dots",
			0x0E: "Celestial",
			0x0F: "Koi",
			0x10: "Paint_Strokes",
			0x11: "Polka_Dots",
			0x12: "Rubber_Bands",
			0x13: "Stripes",
			0x14: "Terrazzo",
			0x15: "Bee_A",
			0x16: "Bee_B",
			0x17: "Bee_C",
			0x18: "Zebra",
			0x19: "Mosaic",
			0x1A: "Cow",
			0x1B: "Pawprint_LSide",
			0x1C: "Diamonds",
			0x1D: "Tiger_Stripes",
			0x1E: "Tiger_Stripes_Tall",
			0x1F: "Tuxedo",
			0x20: "Saddle_Spots",
			0x21: "Neck_Splat",
			0x22: "Plaid",
			0x23: "Squares",
			0x24: "Scales",
		};

		let ePlumageInterpolation = 
		{
			0x00: "None",
			0x01: "Front_To_Back",
			0x02: "Top_To_Bottom",
			0x03: "Random"
		};

		//==================================================
		// STRUCT
		let sMaterialParameter = new Genome.Gene("",
		{
			1: new Genome.Gene("Waxy"),
			2: new Genome.Gene("Metallic"),
			3: new Genome.Gene("Glassy"),
			4: new Genome.Gene("Roughness"),
			5: new Genome.Gene("Sparkle"),
		});

		let sCoord = new Genome.Gene("",
		{
			1: new Genome.Gene("X", {}, false, false, {}, 0.0),
			2: new Genome.Gene("Y", {}, false, false, {}, 0.0),
		});

		let sPlumageParameter = new Genome.Gene("",
		{
			1: new Genome.Gene("Length"),
			2: new Genome.Gene("Thickness"),
			3: new Genome.Gene("TaperTop"),
			4: new Genome.Gene("TaperBottom"),
			5: new Genome.Gene("Sweep"),
			6: new Genome.Gene("Flow"),
			7: new Genome.Gene("Tilt"),
			8: new Genome.Gene("Curl"),
			9: new Genome.Gene("Weight"),
			10: new Genome.Gene("PatternOffset", sCoord.genes),
			11: new Genome.Gene("PatternScaleChange"),
			12: new Genome.Gene("PatternStretch"),
			13: new Genome.Gene("WidthAdjust"),
			14: new Genome.Gene("ThicknessAdjust"),
		});

		let sStyleParameter = new Genome.Gene("",
		{
			1: new Genome.Gene("AlphaMaskOption"),
			2: new Genome.Gene("Length"),
			3: new Genome.Gene("Width"),
			4: new Genome.Gene("Fold"),
			5: new Genome.Gene("Sweep"),
			6: new Genome.Gene("Tilt"),
			7: new Genome.Gene("Curl"),
			8: new Genome.Gene("Flow"),
			9: new Genome.Gene("Weight"),
			10: new Genome.Gene("Rotation"),
			11: new Genome.Gene("MaskExpansion"),
			20: new Genome.Gene("PatternOffset", sCoord.genes),
			21: new Genome.Gene("PatternScaleChange"),
			22: new Genome.Gene("PatternStretch"),
		});

		let sPrimePlumageParameter = new Genome.Gene("",
		{
			1: new Genome.Gene("Location", {}, false, false, eBodyPart),
			2: new Genome.Gene("Style", sStyleParameter.genes),
			3: new Genome.Gene("StyleVariant", sStyleParameter.genes),
			4: new Genome.Gene("InterpolationOption", {}, false, false, ePlumageInterpolation),
			5: new Genome.Gene("Sharpness"),
		});

		let sDiffusionParameter = new Genome.Gene("",
		{
			1: new Genome.Gene("DiffusionRate", {}, false, false, {}, 0.0),
			2: new Genome.Gene("FeedRate", {}, false, false, {}, 0.0),
			3: new Genome.Gene("KillRate", {}, false, false, {}, 0.0),
		});

		//==================================================
		// MAIN
		let tree = new Genome.Gene("Traits",
		{
			3: new Genome.Gene("Pattern",
			{
				1: new Genome.Gene("Layers",
				{
					1: new Genome.Gene("MaskType", {}, false, false, eMaskType),
					2: new Genome.Gene("SecondaryMaskType", {}, false, false, eMaskType),
					3: new Genome.Gene("SecondaryMaskBlendMode", {}, false, false, eBlendMode),
					4: new Genome.Gene("SecondaryMaskInfluence"),
					5: new Genome.Gene("MaskSharpness"),
					6: new Genome.Gene("MaskCutoff"),
					8: new Genome.Gene("MaterialIndex"),
					9: new Genome.Gene("Invert"),
					//10: new Genome.Gene("ExcludePlumage"),
					//11: new Genome.Gene("OnlyPlumage"),
					12: new Genome.Gene("ExcludeBody"),
					13: new Genome.Gene("ExcludePrimaryPlumage"),
					14: new Genome.Gene("ExcludeSecondaryPlumage"),
				}, true),
				2: new Genome.Gene("Masks",
				{
					1: new Genome.Gene("MaskType", {}, false, false, eMaskType),
					2: new Genome.Gene("PatternMaskType", {}, false, false, ePatternType),
					3: new Genome.Gene("PatternTransform",
					{
						1: new Genome.Gene("X", {}, false, false, {}, 0.0),
						2: new Genome.Gene("Y", {}, false, false, {}, 0.0),
						3: new Genome.Gene("V", {}, false, false, {}, 0.0),
						4: new Genome.Gene("W", {}, false, false, {}, 0.0),
					}),
				}, true),
				3: new Genome.Gene("ProceduralPattern",
				{
					1: new Genome.Gene("NoiseScale"),
					2: new Genome.Gene("NoiseCutoff"),
					3: new Genome.Gene("SimulationIteration"),
					4: new Genome.Gene("NoiseOffsetX"),
					5: new Genome.Gene("NoiseOffsetY"),
					7: new Genome.Gene("DorsalReactionDiffusionParameter", sDiffusionParameter.genes),
					8: new Genome.Gene("VentralReactionDiffusionParameter", sDiffusionParameter.genes),
				}),
				8: new Genome.Gene("AnimationSpeed"),
				9: new Genome.Gene("AnimationPhase"),
				10: new Genome.Gene("AnimationLayers",
				{
					1: new Genome.Gene("AnimationSharpness"),
					2: new Genome.Gene("AnimationTilt"),
					3: new Genome.Gene("AnimationCutoff"),
					4: new Genome.Gene("AnimationPhaseOffset"),
					5: new Genome.Gene("AnimationLevel"),
					6: new Genome.Gene("AnimationSpread"),
				}, true),
				11: new Genome.Gene("FaceColorIndex"),
				12: new Genome.Gene("ChancePatternIsAnimated"),
			}),
			5: new Genome.Gene("Color",
			{
				1: new Genome.Gene("Colors",
				{
					1: new Genome.Gene("Red", {}, false, false, {}, 0.0),
					2: new Genome.Gene("Green", {}, false, false, {}, 0.0),
					3: new Genome.Gene("Blue", {}, false, false, {}, 0.0),
				}, true),
			}),
			6: new Genome.Gene("Face",
			{
				1: new Genome.Gene("FaceMaskImage", {}, false, false, eFaceMask),
				2: new Genome.Gene("Sharpness"),
				3: new Genome.Gene("Cutoff"),
			}),
			10: new Genome.Gene("Ears",
			{
				11: new Genome.Gene("Count"),
				12: new Genome.Gene("Width"),
				13: new Genome.Gene("Length"),
				14: new Genome.Gene("Thickness"),
				15: new Genome.Gene("FlattenTip"),
				16: new Genome.Gene("FlattenLeft"),
				17: new Genome.Gene("FlattenRight"),
				18: new Genome.Gene("FlattenBase"),
				19: new Genome.Gene("FlattenTip_2"),
				20: new Genome.Gene("PushLeft"),
				21: new Genome.Gene("PushRight"),
				22: new Genome.Gene("CornerTipLeft"),
				23: new Genome.Gene("CornerTipRight"),
				24: new Genome.Gene("CornerBaseLeft"),
				25: new Genome.Gene("CornerBaseRight"),
				26: new Genome.Gene("CurveLeft"),
				27: new Genome.Gene("CurveRight"),
				28: new Genome.Gene("CurveBackwards"),
				29: new Genome.Gene("ConcaveAll"),
				30: new Genome.Gene("ConcaveBase"),
				31: new Genome.Gene("ConcaveCenter"),
				33: new Genome.Gene("FoldLeft"),
				34: new Genome.Gene("Point"),
				//  : new Genome.Gene("PatternPosition"),
				//  : new Genome.Gene("EarGeneVersion"),
			}),
			20: new Genome.Gene("Horns",
			{
				   1: new Genome.Gene("Radius"),
				2: new Genome.Gene("Length"),
				3: new Genome.Gene("ShapeX"),
				4: new Genome.Gene("ShapeY"),
				5: new Genome.Gene("ShapeZ"),
				6: new Genome.Gene("Sides"),
				7: new Genome.Gene("Tilt"),
				8: new Genome.Gene("Count"),
				9: new Genome.Gene("Warp"),
				10: new Genome.Gene("Roundness"),
				11: new Genome.Gene("Organicness"),
				12: new Genome.Gene("StripeColorCount"),
			}),
			31: new Genome.Gene("BodyShape",
			{
				1: new Genome.Gene("LimbLength"),
				2: new Genome.Gene("BodyLength"),
				3: new Genome.Gene("Chonk"),
				//4: new Genome.Gene("Distortion"),
			}),
			41: new Genome.Gene("Preferences",
			{
				1: new Genome.Gene("Likes", {}, false, false, eLikes),
				4: new Genome.Gene("LikedZones", {}, false, true),
			}),
			51: new Genome.Gene("Material",
			{
				1: new Genome.Gene("Base", sMaterialParameter.genes),
				2: new Genome.Gene("Pattern", sMaterialParameter.genes),
				3: new Genome.Gene("PatternDifference"),
				4: new Genome.Gene("Fur"),
				5: new Genome.Gene("Iridescence"),
				6: new Genome.Gene("IridescenceDitection", {}, false, false, eIridescenceDirection),
				7: new Genome.Gene("SaturationReduction"),
			}),
			62: new Genome.Gene("Plumage",
			{
				1: new Genome.Gene("Seed"),
				2: new Genome.Gene("PlumageLocation", {}, false, false, eBodyPart),
				3: new Genome.Gene("BaseParameter", sPlumageParameter.genes),
				4: new Genome.Gene("UseBottomParameter"),
				5: new Genome.Gene("BottomParameter", sPlumageParameter.genes),
				6: new Genome.Gene("UseHeadParameter"),
				7: new Genome.Gene("HeadParameter", sPlumageParameter.genes),
				8: new Genome.Gene("Sarpness"),
				9: new Genome.Gene("UsePlumageV3"),
				10: new Genome.Gene("PrimaryPlumage", sPrimePlumageParameter.genes),
				11: new Genome.Gene("SecondaryPlumage", sPrimePlumageParameter.genes),
			}),
			63: new Genome.Gene("Tail",
			{
				1: new Genome.Gene("TailPlumeCount"),
				2: new Genome.Gene("TailPlumage", sPlumageParameter.genes),
				3: new Genome.Gene("BasePlumageParameter", sPlumageParameter.genes),
				4: new Genome.Gene("TipPlumageParameter", sPlumageParameter.genes),
				5: new Genome.Gene("UseTailV3"),
				//6: new Genome.Gene("IsSecondaryPlumage"),
				7: new Genome.Gene("PlumageDistribution"),
				8: new Genome.Gene("BasePlumage", sStyleParameter.genes),
				9: new Genome.Gene("TipPlumage", sStyleParameter.genes),
			}),
			71: new Genome.Gene("Voice",
			{
				1: new Genome.Gene("VoiceNumber"),
			}),
		});

		return tree;
	}

	initGenome()
	{
		let tree = new Genome.Gene("Genome",
		{
			1: this.initTraits(),
			2: new Genome.Gene("DotGuid"),
			3: new Genome.Gene("ChaosTraidIds", {}, true, true),
			4: new Genome.Gene("PlayerGuid", {}, false, true)
		});

		return tree;
	}

	toString(space = 4)
	{
		//return JSON.stringify(this.obj).replace(/"_____(.*?)_____"/g, "$1");
		return JSON.stringify(this.obj, null, space);
	}

	GetTrait_Pattern()
	{
	}
	
	GetTrait_Color()
	{
	}
	
	GetTrait_Face()
	{
	}
	
	GetTrait_Ears()
	{
	}
	
	GetTrait_Horns()
	{
	}
	
	GetTrait_BodyShape()
	{
	}
	
	GetTrait_Preferences()
	{
	}
	
	GetTrait_Material()
	{
		let traits = {};
		if (this.obj.hasOwnProperty("Traits"))
			traits = this.obj.Traits;
		else
			traits = this.obj;

		if (traits.hasOwnProperty("Material"))
		{
			let m = traits["Material"];
			return Traits.GetMaterial(m);
		}

		return Traits.eMaterial.Undefined;
	}

	GetTrait_Plumage()
	{
	}
	
	GetTrait_Tail()
	{
	}
	
	GetTrait_Voice()
	{
	}
}
