
module at.jku.ssw.Coco {
	
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
	}

	export class BitArray {
		constructor(size: number) {
			// TODO:
		}

		public Or(other: BitArray) {
			// TODO:
		}
	}

	export class StringBuilder {
		constructor(s: string) {
			// TODO
		}
		public AppendNumber(n: number) {
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