// export class EnumName
// {
// 	constructor(value, enumType)
// 	{
// 		this.value = value;
// 		this.enumType = enumType;
// 	}

// 	toString()
// 	{
// 		for (const [key, val] of Object.entries(this.enumType))
// 		{
// 			if (val.value === this.value)
// 				return key;
// 		}

// 		return `<unknown enum value: ${this.value}>`;
// 	}

// 	valueOf()
// 	{
// 		return this.value;
// 	}
// }

//========================================
// PATTERN
//========================================

//========================================
// COLOR
//========================================

//========================================
// FACE
//========================================

//========================================
// EARS
//========================================

//========================================
// HORNS
//========================================

//========================================
// BODY SHAPE
//========================================

//========================================
// PREFERENCES
//========================================

//========================================
// MATERIAL
//========================================

export const eMaterial =
{
	"Undefined"		: -1,
	"None"			:  0,
									// Lv unlocked
	"Matte"			:  1,	//  1
	"Waxy"			:  2,	//  2
	"Chome"			:  3,	//  3
	"Glitter"		:  4,	//  4
	"Brushed"		:  5,	//  6
	"Glassy"		:  6,	//  7
	"Bedazzled"		:  7,	//  8
	"Rusty"			:  8,	//  9
	"Starry"		:  9,	// 11
	"Fuzzy"			: 10,	// 12
	"Ore"			: 11,	// 15
	"Glimmer"		: 12,	// 22
	"Iridescent"	: 13,	// 28
	"Furry"			: 14,	// 31
	"Slimy"			: 15,	// 33
	"LED"			: 16,	// 42
	"Beetle"		: 17,	// 43
	"Furidescent"	: 18,	// 44
	"Static"		: 19,	// 50
									// date released
	"Gummy"			: 20,	// 2023-05-19
	"Geode"			: 21,	// 
	"Pulp"			: 22,	// 
	"Scarab"		: 23,	// 
}

export function GetMaterial(m)
{
	if (MaterialIs_Matte(m))		return eMaterial.Matte;
	if (MaterialIs_Waxy(m))			return eMaterial.Waxy;
	if (MaterialIs_Chome(m))		return eMaterial.Chome;
	if (MaterialIs_Glitter(m))		return eMaterial.Glitter;
	if (MaterialIs_Brushed(m))		return eMaterial.Brushed;
	if (MaterialIs_Glossy(m))		return eMaterial.Glossy;
	if (MaterialIs_Bedazzled(m))	return eMaterial.Bedazzled;
	if (MaterialIs_Rusty(m))		return eMaterial.Rusty;
	if (MaterialIs_Starry(m))		return eMaterial.Starry;
	if (MaterialIs_Fuzzy(m))		return eMaterial.Fuzzy;
	if (MaterialIs_Ore(m))			return eMaterial.Ore;
	if (MaterialIs_Glimmer(m))		return eMaterial.Glimmer;
	if (MaterialIs_Iridescent(m))	return eMaterial.Iridescent;
	if (MaterialIs_Furry(m))		return eMaterial.Furry;
	if (MaterialIs_Slimy(m))		return eMaterial.Slimy;
	if (MaterialIs_LED(m))			return eMaterial.LED;
	if (MaterialIs_Beetle(m))		return eMaterial.Beetle;
	if (MaterialIs_Furidescent(m))	return eMaterial.Furidescent;
	if (MaterialIs_Static(m))		return eMaterial.Static;
	//---
	if (MaterialIs_Gummy(m))		return eMaterial.Gummy;
	if (MaterialIs_Geode(m))		return eMaterial.Geode;
	if (MaterialIs_Pulp(m))			return eMaterial.Pulp;
	if (MaterialIs_Scarab(m))		return eMaterial.Scarab;

	return eMaterial.None;
};

function MaterialIs_Matte(m)
{
	return false;
};

function MaterialIs_Waxy(m)
{
	// check if m has all this property
	m["Base"] ??= {};
	m["Pattern"] ??= {}
	m["PatternDifference"] ??= 0.0;
	m["Fur"] ??= 0.0;
	//m["Iridescence"] ??= 0.0;
	//m["IridescenceDitection"] ??= 0;	// eIridescenceDirection.Clockwise
	//m["SaturationReduction"] ??= 0.0;
	
	let b = m.Base;
	// check if m has this Base property
	b["Waxy"] ??= 0.0;
	b["Metallic"] ??= 0.0;
	b["Glassy"] ??= 0.0;
	b["Roughness"] ??= 0.0;
//	b["Sparkle"] ??= 0.0;

	let p = m.Pattern;
	// check if m has this Pattern property
	p["Waxy"] ??= 0.0;
	p["Metallic"] ??= 0.0;
	p["Glassy"] ??= 0.0;
	p["Roughness"] ??= 0.0;
//	p["Sparkle"] ??= 0.0;

	// check if the property falls under this condition
		// min/equal values	max values
	if (b.Waxy >= 0.8				&&	b.Waxy <= 1.0				&&
										b.Metallic <= 0.1			&&
										b.Glassy <= 0.1				&&
										b.Roughness <= 1.0			&&
		p.Waxy >= 0.8				&&	p.Waxy <= 1.0				&&
										p.Metallic <= 0.1			&&
										p.Glassy <= 0.1				&&
										p.Roughness <= 0.1			&&
		m.PatternDifference >= -0.5	&&	m.PatternDifference <= 1.0 	&&
		m.Fur >= -1.0)
		return true;

	return false;
};

function MaterialIs_Chome(m)
{
	return false;
};

function MaterialIs_Glitter(m)
{
	return false;
};

function MaterialIs_Brushed(m)
{
	return false;
};

function MaterialIs_Glossy(m)
{
	return false;
};

function MaterialIs_Bedazzled(m)
{
	return false;
};

function MaterialIs_Rusty(m)
{
	return false;
};

function MaterialIs_Starry(m)
{
	return false;
};

function MaterialIs_Fuzzy(m)
{
	return false;
};

function MaterialIs_Ore(m)
{
	// check if m has all this property
	m["Base"] ??= {};
	m["Pattern"] ??= {};
	m["PatternDifference"] ??= 0.0;
	m["Fur"] ??= 0.0;
//	m["Iridescence"] ??= 0.0;
//	m["IridescenceDitection"] ??= 0;	// eIridescenceDirection.Clockwise
//	m["SaturationReduction"] ??= 0.0;

	let b = m.Base;
	// check if m has this Base property
	b["Waxy"] ??= 0.0;
	b["Metallic"] ??= 0.0;
	b["Glassy"] ??= 0.0;
//	b["Roughness"] ??= 0.0;
//	b["Sparkle"] ??= 0.0;

	let p = m.Pattern;
	// check if m has this Pattern property
//	p["Waxy"] ??= 0.0;
	p["Metallic"] ??= 0.0;
	p["Glassy"] ??= 0.0;
//	p["Roughness"] ??= 0.0;
//	p["Sparkle"] ??= 0.0;

	// check if the property falls under this condition
		// min/equal values					max values
	if (b.Waxy >= 0.8				&& 	b.Waxy <= 1.0 		&&
										b.Metallic <= 0.1 	&&
										b.Glassy <= 0.1 	&&
		p.Metallic >= 0.9			&&	p.Metallic <= 1.0 	&&
		p.Glassy >= 0.9				&&	p.Glassy <= 1.0 	&&
		m.PatternDifference == 1	&&
		m.Fur >= -1)
		return true;

	return false;
};

function MaterialIs_Glimmer(m)
{
	return false;
};

function MaterialIs_Iridescent(m)
{
	return false;
};

function MaterialIs_Furry(m)
{
	// check if m has all this property
	m["Base"] ??= {};
	m["Pattern"] ??= {}
	m["PatternDifference"] ??= 0.0;
	m["Fur"] ??= 0.0
//	m["Iridescence"] ??= 0.0;
//	m["IridescenceDitection"] ??= 0;	// eIridescenceDirection.Clockwise
//	m["SaturationReduction"] ??= 0.0;

	// check if m has this Base property
	let b = m.Base;
	b["Waxy"] ??= 0.0;
	b["Metallic"] ??= 0.0;
//	b["Glassy"] ??= 0.0;
	b["Roughness"] ??= 0.0;
	b["Sparkle"] ??= 0.0;

	let p = m.Pattern;
	// check if m has this Pattern property
	p["Waxy"] ??= 0.0;
	p["Metallic"] ??= 0.0;
	p["Glassy"] ??= 0.0;
	p["Roughness"] ??= 0.0;
	p["Sparkle"] ??= 0.0;

	// check if the property falls under this condition
		// min/equal values		max values
	if (						b.Waxy <= 1.0 				&&
		b.Metallic >= -1.0	&&	b.Metallic <= 1.0			&&
		b.Glassy >= -1.0	&&	b.Glassy <= 1.0				&&
								b.Roughness <= 1.0			&&
		b.Sparkle >= -5.0	&&	b.Sparkle <= 1.0			&&
								p.Waxy <= 1.0				&&
		p.Metallic >= -1.0	&&	p.Metallic <= 1.0			&&
		p.Glassy >= -1.0	&&	p.Glassy <= 1.0				&&
								p.Roughness <= 1.0			&&
		p.Sparkle >= -5.0	&&	p.Sparkle <= 1.0			&&
								m.PatternDifference <= 1.0	&&
		m.Fur >= 0.6		&&	m.Fur <= 1.0)
		return true;

	return false;
};

function MaterialIs_Slimy(m)
{
	return false;
};

function MaterialIs_LED(m)
{
	return false;
};

function MaterialIs_Beetle(m)
{
	return false;
};

function MaterialIs_Furidescent(m)
{
	return false;
};

function MaterialIs_Static(m)
{
	return false;
};

function MaterialIs_Gummy(m)
{
	return false;
};

function MaterialIs_Geode(m)
{
	return false;
};

function MaterialIs_Pulp(m)
{
	return false;
};

function MaterialIs_Scarab(m)
{
	return false;
};

//========================================
// PLUMAGE
//========================================

//========================================
// TAIL
//========================================

//========================================
// VOICE
//========================================
