
module at.jku.ssw.coco {
	
	export class FileStream {
		public ReadCharacter(): string {
			// TODO
			return "\0";
		}
	}

	export class StreamWriter {
		public Write(s: string) {
		}

		public WriteLineText(s: string) {
			// TODO
		}

		public WriteFormatted1(format: string, o1: any) {
			// TODO
		}

		public WriteFormatted2(format: string, o1: any, o2: any) {
			// TODO
		}

		public WriteFormatted3(format: string, o1: any, o2: any, o3: any) {
			// TODO
		}

		public WriteLineFormatted1(format: string, o1: any) {
			// TODO
		}

		public WriteLineFormatted2(format: string, o1: any, o2: any) {
			// TODO
		}

		public WriteLine() {
			// TODO
		}

		public Close() {
			// TODO
		}

	}

	export class StringWriter {
		public Write(s: string) {
			// TODO:
		}

		public WriteLine(s: string) {
			// TODO:
		}

		public ToString(): string {
			// TODO
			return null;
		}
	}

	export class TextWriter {
		public WriteLine() {
			// TODO
		}

		public WriteLineText(s: string) {
			// TODO
		}

		public Write(s: string) {
			// TODO
		}

		public WriteFormatted1(format: string, o1: any) {
			// TODO
		}

		public WriteFormatted2(format: string, o1: any, o2 : any) {
			// TODO
		}

		public WriteFormatted3(format: string, o1: any, o2: any, o3: any) {
			// TODO
		}

		public WriteLineFormatted1(format: string, o1: any) {
			// TODO
		}
		
		public WriteLineFormatted2(format: string, o1: any, o2: any) {
			// TODO
		}

	}

	export function isLetter(str: string): bool {
		return str.length === 1 && str.match(/[a-z]/i) != null;
	}

	export class BitArray {
		constructor(size: number, value : bool) {
			// TODO:
		}

		public Or(other: BitArray) : BitArray {
			// TODO:
			return null;
		}

		get Count(): number {
			// TODO:
			return 0;
		}

		Clone(): BitArray {
			// TODO
			return null;
		}
		SetAll(b: bool) {
			// TODO
		}

		And(other: BitArray) : BitArray {
			// TODO
			return null;
		}

		Not(): BitArray {
			// TODO
			return this.Clone();
		}
	}

	export class Hashtable {

		public get length() : number {
			// TODO
			return 0;
		}

		public get(name: string) : Symbol {
			// TODO
			return null;
		}
	}

	export class StringBuilder {
		constructor(s: string) {
			// TODO
		}
		public appendNumber(n: number) {
			// TODO
		}

		public append(s: string) {
			// TODO
		}

		public get length() : number {
			// TODO
			return 0;
		}

		public toString(): string {
			// TODO
			return "";
		}
	}
}